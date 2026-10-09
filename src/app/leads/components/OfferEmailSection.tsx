"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Mail } from "lucide-react";
import type { Lead } from "../../../lib/leads/model";
import { DEFAULT_OFFER_INTRO, offerEmail } from "../../../lib/leads/offerEmail";
import { apiUrl, fmtDate } from "./shared";

/**
 * The rep's one-click follow-up: the $1 week offer and Stefano's booking
 * link, previewed exactly as the lead will get it (the same offerEmail()
 * the server sends), with the opening line and an optional personal line
 * editable. Sending goes through /api/leads/action, which emails from the
 * Apex GHL location and tags the contact offer-sent:<date>.
 */

const SENT_TAG = /^offer-sent:(\d{4}-\d{2}-\d{2})$/;

export default function OfferEmailSection({ lead, repName }: { lead: Lead; repName: string }) {
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState(DEFAULT_OFFER_INTRO);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setIntro(DEFAULT_OFFER_INTRO);
    setNote("");
    setState("idle");
    setError(null);
  }, [lead.id]);

  const lastSent = useMemo(
    () =>
      lead.tags
        .map((t) => t.match(SENT_TAG)?.[1])
        .filter((d): d is string => Boolean(d))
        .sort()
        .pop() ?? null,
    [lead.tags],
  );

  const preview = useMemo(
    () => offerEmail({ firstName: lead.name.includes("@") ? "" : lead.name, repName, intro, note }),
    [lead.name, repName, intro, note],
  );

  const send = async () => {
    setState("sending");
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/leads/action"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, action: "send-offer", intro, note: note || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
      setState("sent");
      setOpen(false);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send the email");
    }
  };

  return (
    <div className="ld-drawer-section">
      <div className="ld-drawer-section-title">$1 week offer email</div>
      {!lead.email ? (
        <p className="ld-offer-muted">No email address on this lead.</p>
      ) : state === "sent" ? (
        <p className="ld-offer-sent">
          <Check size={13} /> Sent to {lead.email}
        </p>
      ) : (
        <>
          {lastSent && <p className="ld-offer-muted">Last sent {fmtDate(lastSent)}</p>}
          {!open ? (
            <button type="button" className="ld-btn ld-btn-primary" onClick={() => setOpen(true)}>
              <Mail size={12} /> {lastSent ? "Send again" : "Send $1 week + call link"}
            </button>
          ) : (
            <div className="ld-offer">
              <label className="ld-offer-label">
                Opening line
                <textarea className="ld-note-textarea" value={intro} onChange={(e) => setIntro(e.target.value)} />
              </label>
              <label className="ld-offer-label">
                Personal line (optional)
                <textarea
                  className="ld-note-textarea"
                  placeholder="Anything specific from the call"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="ld-offer-subject">
                <span>Subject</span> {preview.subject}
              </div>
              <iframe className="ld-offer-preview" title="Email preview" sandbox="" srcDoc={preview.html} />
              {error && <p className="ld-offer-error">{error}</p>}
              <div className="ld-drawer-actions">
                <button type="button" className="ld-btn" onClick={() => setOpen(false)} disabled={state === "sending"}>
                  Cancel
                </button>
                <button type="button" className="ld-btn ld-btn-primary" onClick={send} disabled={state === "sending"}>
                  <Mail size={12} /> {state === "sending" ? "Sending…" : `Send to ${lead.email}`}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
