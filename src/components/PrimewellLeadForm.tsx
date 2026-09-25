"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { readStoredAttribution } from "./LeadAttribution";

/**
 * The form on /primewell. A PrimeWell applicant leaves their name, email and
 * phone, which puts them into Apex's own GoHighLevel CRM tagged
 * `primewell-lead` (see /api/primewell-lead), and that tag starts the
 * PrimeWell SMS and email sequence there. The thank-you state then sends
 * them on to the free account, so the form never stands between an
 * applicant and the software.
 */
export default function PrimewellLeadForm({ signupUrl }: { signupUrl: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  // Bots fill every field and submit instantly; people do neither.
  const openedAt = useRef(Date.now());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const attribution = readStoredAttribution();
    const params = new URLSearchParams(window.location.search);

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/primewell-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          company: String(data.get("company") ?? ""),
          elapsedMs: Date.now() - openedAt.current,
          utmSource: params.get("utm_source") ?? attribution?.utmSource ?? undefined,
          utmMedium: params.get("utm_medium") ?? attribution?.utmMedium ?? undefined,
          utmCampaign: params.get("utm_campaign") ?? attribution?.utmCampaign ?? undefined,
          pageUrl: window.location.href,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; eventId?: string };
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");

      setFirstName(String(data.get("name") ?? "").trim().split(/\s+/)[0] ?? "");
      setStatus("done");
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      fbq?.(
        "track",
        "Lead",
        { content_name: "PrimeWell to Apex" },
        body.eventId ? { eventID: body.eventId } : undefined,
      );
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="pw-form pw-form-done" role="status">
        <CheckCircle2 size={34} strokeWidth={2} aria-hidden="true" className="pw-done-icon" />
        <h3>{firstName ? `You're in, ${firstName}.` : "You're in."}</h3>
        <p>
          We just sent you a text and an email with your next steps. Now open your free Apex
          account and scan the PrimeWell catalog.
        </p>
        <a className="pop-cta pop-cta-lg" href={signupUrl}>
          <span className="pop-cta-row">
            Open my free Apex account
            <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <small>3 wholesale suppliers on sign up, plus 3 every month</small>
        </a>
      </div>
    );
  }

  return (
    <form className="pw-form" onSubmit={onSubmit} noValidate={false}>
      <p className="pw-form-title">Get your suppliers and your free Apex account</p>
      <div className="pw-fields">
        <label className="pw-field">
          <span>Full name</span>
          <input name="name" type="text" autoComplete="name" required maxLength={120} />
        </label>
        <label className="pw-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={255} />
        </label>
        <label className="pw-field">
          <span>Mobile phone</span>
          <input name="phone" type="tel" autoComplete="tel" required maxLength={30} />
        </label>
        {/* Honeypot: hidden from people, irresistible to form bots. */}
        <label className="pw-hp" aria-hidden="true">
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p className="pw-error" role="alert">
          {error}
        </p>
      )}

      <button className="pop-cta pop-cta-lg pw-submit" type="submit" disabled={status === "sending"}>
        <span className="pop-cta-row">
          {status === "sending" ? "Sending..." : "Unlock my suppliers"}
          <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <small>Free. Takes 10 seconds.</small>
      </button>

      <p className="pw-consent">
        By submitting, you agree to receive texts and emails from Apex Applications about your
        account and suppliers. Message frequency varies. Message and data rates may apply. Reply
        STOP to opt out, HELP for help. See our <a href="/privacy">privacy policy</a>.
      </p>
    </form>
  );
}
