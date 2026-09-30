"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Minus, Phone, X } from "lucide-react";
import type { ActivationTier, Lead, Stage } from "../../../lib/leads/model";
import {
  ACTIVATION_COLORS,
  SELLER_TYPE_LABELS,
  SOURCE_LABELS,
  fmtDate,
  lastOutreachLabel,
  money,
  outreachDates,
  todayNY,
} from "./shared";

const TIMELINE: { stage: Stage; label: string; getDate: (l: Lead) => string | null }[] = [
  { stage: "lead", label: "Lead", getDate: (l) => l.leadAt },
  { stage: "registered", label: "Account", getDate: (l) => l.registeredAt },
  { stage: "trial", label: "Trial", getDate: (l) => l.trialStartedAt },
  { stage: "customer", label: "Customer", getDate: (l) => l.customerSince },
  { stage: "churned", label: "Churned", getDate: (l) => l.churnedAt },
];

const ACTIVATION_ROWS: { tier: ActivationTier; label: string; reached: (l: Lead) => boolean; detail: (l: Lead) => string }[] = [
  {
    tier: "emailed",
    label: "Vendor email",
    reached: (l) => l.activation.vendorEmailSent,
    detail: (l) => (l.activation.vendorEmailSent ? "Sent" : l.activation.vendorEmailRequested ? "Requested" : "Not sent"),
  },
  {
    tier: "scanned",
    label: "First scan",
    reached: (l) => Boolean(l.activation.firstScanAt),
    detail: (l) =>
      l.activation.firstScanAt
        ? `${fmtDate(l.activation.firstScanAt)}${l.activation.scans > 0 ? ` · ${l.activation.scans} scan${l.activation.scans === 1 ? "" : "s"}` : ""}`
        : "Not yet",
  },
  {
    tier: "database",
    label: "Database",
    reached: (l) => l.activation.databaseProducts > 0,
    detail: (l) =>
      l.activation.databaseProducts > 0
        ? `${l.activation.databaseProducts} product${l.activation.databaseProducts === 1 ? "" : "s"}${
            l.activation.databaseUpdatedAt ? ` · updated ${fmtDate(l.activation.databaseUpdatedAt)}` : ""
          }`
        : "Empty",
  },
  {
    tier: "connected",
    label: "Seller Central",
    reached: (l) => Boolean(l.activation.amazonConnectedAt),
    detail: (l) => (l.activation.amazonConnectedAt ? fmtDate(l.activation.amazonConnectedAt) : "Not connected"),
  },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ld-icon-btn"
      style={{ width: 20, height: 20 }}
      title="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          // Clipboard access denied — nothing to do but leave the value visible to copy by hand.
        }
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

export default function LeadDrawer({
  lead,
  onClose,
  onMarkContacted,
  pending,
  error,
}: {
  lead: Lead | null;
  onClose: () => void;
  onMarkContacted: (lead: Lead, note: string) => Promise<void>;
  pending: boolean;
  error: string | null;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("");
  }, [lead?.id]);

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!lead) return null;

  const today = todayNY();
  const alreadyContactedToday = lead.lastOutreachAt === today;
  const outreach = outreachDates(lead.tags);

  return (
    <>
      <div className="ld-drawer-overlay" onClick={onClose} />
      <div className="ld-drawer" role="dialog" aria-label={`${lead.name} details`}>
        <div className="ld-drawer-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ld-drawer-title">{lead.name}</div>
            <div style={{ fontSize: 11, color: "var(--ld-text-muted)", marginTop: 2 }}>
              {SOURCE_LABELS[lead.source]}
              {lead.sourceDetail ? ` · ${lead.sourceDetail}` : ""}
            </div>
          </div>
          <button type="button" className="ld-icon-btn" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="ld-drawer-body">
          <div className="ld-drawer-section">
            <div className="ld-drawer-field-row">
              <span className="ld-drawer-field-label">Email</span>
              <span className="ld-drawer-field-value">
                {lead.email ?? "—"}
                {lead.email && <CopyButton value={lead.email} />}
              </span>
            </div>
            <div className="ld-drawer-field-row">
              <span className="ld-drawer-field-label">Phone</span>
              <span className="ld-drawer-field-value">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} style={{ color: "var(--ld-accent)" }}>
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="ld-drawer-field-row">
              <span className="ld-drawer-field-label">Seller type</span>
              <span className="ld-drawer-field-value">{SELLER_TYPE_LABELS[lead.sellerType]}</span>
            </div>
            {lead.obstacle && (
              <div className="ld-drawer-field-row">
                <span className="ld-drawer-field-label">Obstacle</span>
                <span className="ld-drawer-field-value">{lead.obstacle}</span>
              </div>
            )}
            {lead.demoTiming && (
              <div className="ld-drawer-field-row">
                <span className="ld-drawer-field-label">Demo timing</span>
                <span className="ld-drawer-field-value">{lead.demoTiming}</span>
              </div>
            )}
            {(lead.planName || lead.mrr > 0) && (
              <div className="ld-drawer-field-row">
                <span className="ld-drawer-field-label">Plan</span>
                <span className="ld-drawer-field-value">
                  {lead.planName ?? "—"}
                  {lead.mrr > 0 ? ` · ${money(lead.mrr)}/mo` : ""}
                </span>
              </div>
            )}
          </div>

          {lead.tags.length > 0 && (
            <div className="ld-drawer-section">
              <div className="ld-drawer-section-title">Tags</div>
              <div className="ld-drawer-tags">
                {lead.tags.map((t) => (
                  <span key={t} className="ld-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="ld-drawer-section">
            <div className="ld-drawer-section-title">Timeline</div>
            <div className="ld-timeline">
              {TIMELINE.map((step, i) => {
                const date = step.getDate(lead);
                const reached = Boolean(date);
                return (
                  <div key={step.stage} className="ld-timeline-step" data-reached={reached}>
                    <div className="ld-timeline-dot-col">
                      <div className="ld-timeline-dot" />
                      {i < TIMELINE.length - 1 && <div className="ld-timeline-line" />}
                    </div>
                    <div>
                      <div className="ld-timeline-label">{step.label}</div>
                      <div className="ld-timeline-date">{reached ? fmtDate(date) : "Not reached"}</div>
                      {step.stage === "churned" && lead.churnReason && <div className="ld-timeline-date">{lead.churnReason}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ld-drawer-section">
            <div className="ld-drawer-section-title">Activation</div>
            {ACTIVATION_ROWS.map((row) => {
              const reached = row.reached(lead);
              return (
                <div key={row.tier} className="ld-drawer-field-row">
                  <span className="ld-drawer-field-label" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {reached ? (
                      <Check size={11} style={{ color: ACTIVATION_COLORS[row.tier], flex: "none" }} />
                    ) : (
                      <Minus size={11} style={{ color: "var(--ld-text-faint)", flex: "none" }} />
                    )}
                    {row.label}
                  </span>
                  <span className="ld-drawer-field-value">{row.detail(lead)}</span>
                </div>
              );
            })}
          </div>

          <div className="ld-drawer-section">
            <div className="ld-drawer-section-title">Outreach history ({lead.outreachCount})</div>
            {outreach.length === 0 ? (
              <p style={{ fontSize: 11.5, color: "var(--ld-text-faint)" }}>Never contacted.</p>
            ) : (
              <div className="ld-outreach-list">
                {outreach.map((d) => (
                  <div key={d} className="ld-outreach-row">
                    <Phone size={11} />
                    {fmtDate(d)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ld-drawer-section">
            <div className="ld-drawer-section-title">Note</div>
            <textarea
              className="ld-note-textarea"
              placeholder="What did you talk about?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && <p style={{ color: "var(--ld-danger)", fontSize: 11, marginTop: 6 }}>{error}</p>}
            <div className="ld-drawer-actions">
              {alreadyContactedToday ? (
                <span
                  className="ld-btn"
                  style={{ borderColor: "var(--ld-success-border)", background: "var(--ld-success-soft)", color: "var(--ld-success)" }}
                >
                  <Check size={12} /> Contacted {lastOutreachLabel(lead.lastOutreachAt)}
                </span>
              ) : lead.ghlContactId ? (
                <button
                  type="button"
                  className="ld-btn ld-btn-primary"
                  disabled={pending}
                  onClick={() => onMarkContacted(lead, note)}
                >
                  <Phone size={12} /> {pending ? "Saving…" : "Mark contacted"}
                </button>
              ) : (
                <span style={{ fontSize: 11.5, color: "var(--ld-text-faint)" }}>No GHL contact to write back to</span>
              )}
            </div>
          </div>
        </div>

        {lead.ghlUrl && (
          <div className="ld-drawer-footer">
            <a href={lead.ghlUrl} target="_blank" rel="noreferrer" className="ld-btn" style={{ width: "100%", justifyContent: "center" }}>
              Open in GHL <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </>
  );
}
