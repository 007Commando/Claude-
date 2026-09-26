"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { readStoredAttribution } from "./LeadAttribution";
import VerifyCode from "./VerifyCode";
import {
  forwardToApp,
  getFriendlyAuthError,
  reportFreeSignup,
  waitForApexAuth,
  withAuthRetry,
  type SignupResult,
} from "./Auth";

/**
 * The form on /primewell, which is a sign-up form.
 *
 * One press does both jobs: the applicant goes into Apex's own GoHighLevel
 * CRM tagged `primewell-lead` (see /api/primewell-lead), which starts the
 * PrimeWell SMS and email sequence there, and their free Apex account is
 * created with acquisition source `primewell`, which is what gives them the
 * PrimeWell walkthrough inside the app. Then the form turns into the same
 * six-digit code screen /auth shows, and a correct code takes them into the
 * app.
 *
 * The CRM write goes first and does not block the account: if GHL is down,
 * the seller still gets their account, which is the thing they came for.
 */

const SIGNUP_CAMPAIGN = "primewell-form";

type Pending = {
  email: string;
  ticket: string | null;
  cooldownMs: number;
  signup: SignupResult | null;
};

const PREFILL_KEY = "apex_pw_prefill";

type Prefill = { name?: string; first_name?: string; last_name?: string; email?: string; phone?: string };

/**
 * What the applicant already typed into PrimeWell's form, handed over by the
 * inline script on /primewell (see app/primewell/page.tsx). Survives a reload
 * of the tab; cleared once the account exists.
 */
function readPrefill(): Prefill | null {
  const w = window as unknown as { __pwPrefill?: Prefill };
  if (w.__pwPrefill) return w.__pwPrefill;
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    return raw ? (JSON.parse(raw) as Prefill) : null;
  } catch {
    return null;
  }
}

function clearPrefill() {
  delete (window as unknown as { __pwPrefill?: Prefill }).__pwPrefill;
  try {
    sessionStorage.removeItem(PREFILL_KEY);
  } catch {
    // Storage blocked: nothing was saved there either.
  }
}

/** The same rule the server applies, so a bad number is caught before sending. */
function looksLikePhone(raw: string): boolean {
  const digits = raw.replace(/[^\d]/g, "");
  return raw.trim().startsWith("+") ? digits.length >= 8 : digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

export default function PrimewellLeadForm() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  // Bots fill every field and submit instantly; people do neither.
  const openedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  // Fill in what PrimeWell already has, leaving anything typed here alone.
  useEffect(() => {
    const prefill = readPrefill();
    const form = formRef.current;
    if (!prefill || !form) return;
    const values: Record<string, string | undefined> = {
      name: prefill.name || [prefill.first_name, prefill.last_name].filter(Boolean).join(" ") || undefined,
      email: prefill.email,
      phone: prefill.phone,
    };
    for (const [field, value] of Object.entries(values)) {
      const input = form.elements.namedItem(field);
      if (value && input instanceof HTMLInputElement && !input.value) input.value = value;
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const phone = String(data.get("phone") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!name) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
    if (!looksLikePhone(phone)) return setError("Please enter a valid mobile number.");
    if (password.length < 6) return setError("Your password needs at least 6 characters.");

    const attribution = readStoredAttribution();
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") ?? attribution?.utmSource ?? undefined;
    const utmMedium = params.get("utm_medium") ?? attribution?.utmMedium ?? undefined;
    const utmCampaign = params.get("utm_campaign") ?? attribution?.utmCampaign ?? undefined;

    setSending(true);
    setError(null);
    try {
      // 1. Into GoHighLevel. A rejected detail stops here, so the seller can
      //    fix it; an outage does not, so the account still gets made.
      const res = await fetch("/api/primewell-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company: String(data.get("company") ?? ""),
          elapsedMs: Date.now() - openedAt.current,
          utmSource,
          utmMedium,
          utmCampaign,
          pageUrl: window.location.href,
        }),
      }).catch(() => null);
      if (res && res.status === 400) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Please check your details.");
      }

      // 2. The Apex account, held before the redirect so the code screen
      //    runs first, exactly as /auth does it.
      const auth = await waitForApexAuth();
      const signup = await withAuthRetry(() =>
        auth.signUp({
          name,
          email,
          password,
          acquisition: { source: "primewell", medium: "funnel", campaign: SIGNUP_CAMPAIGN },
          deferRedirect: true,
        }),
      );

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "primewell",
          event: "apex_signup",
          email,
          visitorId: attribution?.visitorId,
          utmSource: utmSource ?? "primewell",
          utmMedium: utmMedium ?? "funnel",
          utmCampaign: utmCampaign ?? SIGNUP_CAMPAIGN,
        }),
        keepalive: true,
      }).catch(() => {});
      reportFreeSignup(email);
      clearPrefill();

      if (signup?.verification?.ticket) {
        setPending({
          email,
          ticket: signup.verification.ticket,
          cooldownMs: signup.verification.cooldownMs,
          signup,
        });
        setSending(false);
        return;
      }
      // No code was issued (an older cached apex-auth.js, or the backend
      // could not send one): go on in rather than wait for a code that is
      // not coming.
      if (!auth.completeSignup?.(signup)) forwardToApp(auth);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /Please (enter|check)/.test(message) ? message : getFriendlyAuthError(message) || null,
      );
      setSending(false);
    }
  }

  if (pending) {
    return (
      <div className="pw-form pw-form-code">
        <VerifyCode
          email={pending.email}
          ticket={pending.ticket}
          initialCooldownMs={pending.cooldownMs}
          onVerified={() => {}}
          onBack={() => setPending(null)}
          onSubmit={async (code) => {
            const apex = await waitForApexAuth();
            await apex.verifyCode?.({ ticket: pending.ticket, email: pending.email, code });
            if (!apex.completeSignup?.(pending.signup as SignupResult)) forwardToApp(apex);
          }}
          onResend={async () => {
            const apex = await waitForApexAuth();
            const res = await apex.sendVerificationCode?.({
              ticket: pending.ticket,
              email: pending.email,
            });
            return res?.cooldownMs ?? pending.cooldownMs;
          }}
          onChangeEmail={async (next) => {
            const apex = await waitForApexAuth();
            if (!pending.ticket) throw new Error("Start again to change the address");
            const res = await apex.changeVerificationEmail?.({
              ticket: pending.ticket,
              newEmail: next,
            });
            setPending({
              ...pending,
              email: res?.email ?? next,
              ticket: res?.ticket ?? pending.ticket,
              cooldownMs: res?.cooldownMs ?? pending.cooldownMs,
            });
          }}
        />
      </div>
    );
  }

  const alreadyHasAccount = error?.startsWith("An account with this email already exists");

  return (
    <form ref={formRef} className="pw-form" onSubmit={onSubmit} noValidate>
      <p className="pw-form-title">Create your free Apex account</p>
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
        <label className="pw-field">
          <span>Create a password</span>
          <span className="pw-password">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={128}
            />
            <button
              type="button"
              className="pw-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
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
          {alreadyHasAccount && (
            <>
              {" "}
              <a href="/auth">Log in here.</a>
            </>
          )}
        </p>
      )}

      <button className="pop-cta pop-cta-lg pw-submit" type="submit" disabled={sending}>
        <span className="pop-cta-row">
          {sending ? "Creating your account..." : "Unlock my suppliers"}
          <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <small>Free account. 3 suppliers on sign up, plus 3 every month.</small>
      </button>

      <p className="pw-consent">
        By creating your account, you agree to the Apex <a href="/terms">terms</a> and{" "}
        <a href="/privacy">privacy policy</a>, and to receive texts and emails from Apex
        Applications about your account and suppliers. Message frequency varies. Message and data
        rates may apply. Reply STOP to opt out, HELP for help.
      </p>
    </form>
  );
}
