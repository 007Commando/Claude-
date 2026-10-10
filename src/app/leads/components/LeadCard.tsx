"use client";

import { forwardRef } from "react";
import type { Lead } from "../../../lib/leads/model";
import { activationTier, isHotLead } from "../../../lib/leads/model";
import { AlertTriangle, Phone, Star } from "lucide-react";
import { formatDurationShort, sinceLabel, type SalesCall } from "../../../lib/leads/calls";
import {
  ACTIVATION_COLORS,
  SELLER_TYPE_LABELS,
  SOURCE_LABELS,
  fmtDateShort,
  fmtDuration,
  isRecentLead,
  lastOutreachLabel,
  leadAgeMs,
  leadToPaidMs,
  stageJump,
  money,
  stageColorVar,
  trialEndLabel,
} from "./shared";
import SourceLogo from "./SourceLogo";

interface LeadCardProps {
  lead: Lead;
  selected: boolean;
  /** Moved or arrived since this browser last loaded Lead Desk: pulses once. */
  changed?: boolean;
  style?: React.CSSProperties;
  onSelect: (lead: Lead) => void;
  tabIndex: number;
  onFocus?: () => void;
  /** Greys the card out under this label, in place of the activation outline. */
  muted?: string | null;
  /** The most recent sales call with this lead, if any. */
  lastCall?: SalesCall | null;
  /** Keep the activation outline while greyed out (moved on to a later column). */
  keepOutline?: boolean;
}

function stageSuffix(lead: Lead): string | null {
  if (lead.stage === "trial") {
    const label = trialEndLabel(lead.trialEndsAt);
    return label || null;
  }
  if (lead.stage === "customer") {
    const plan = lead.planName ?? "Customer";
    return lead.mrr > 0 ? `${plan} · ${money(lead.mrr)}/mo` : plan;
  }
  if (lead.stage === "churned" && lead.churnReason) {
    return lead.churnReason;
  }
  return null;
}

const LeadCard = forwardRef<HTMLDivElement, LeadCardProps>(function LeadCard(
  { lead, selected, style, onSelect, tabIndex, onFocus, muted, changed, lastCall, keepOutline },
  ref,
) {
  const identity = lead.name || lead.email || "Unknown";
  const suffix = stageSuffix(lead);
  // A call through GHL is contact too: the line says when they were last
  // reached by either a call or "Mark contacted", whichever is newer.
  const callDay = lastCall
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date(lastCall.startedAt))
    : null;
  const lastContact = [lead.lastOutreachAt, callDay].filter((d): d is string => Boolean(d)).sort().pop() ?? null;
  const line2Parts = [lastOutreachLabel(lastContact)];
  if (suffix) line2Parts.push(suffix);
  const age = leadAgeMs(lead);
  const jump = stageJump(lead);
  const total = lead.stage === "customer" ? leadToPaidMs(lead) : null;

  // A paying customer who never connected Amazon gets little out of Apex and is
  // the likeliest to cancel (Stefano, 2026-10-10). Stripe-only rows have no
  // account to check, so they are left out.
  const needsAmazon = lead.stage === "customer" && !lead.stripeOnly && !lead.activation.amazonConnectedAt;

  const tier = activationTier(lead.activation);
  // PrimeWell's "Has Apex account" greying drops the outline; a card greyed because the person
  // moved on to a later column keeps it, so Seller Central and first scan still show (2026-10-10).
  const outline = muted && !keepOutline ? null : tier ? ACTIVATION_COLORS[tier] : null;
  const cardStyle: React.CSSProperties = outline ? { ...style, boxShadow: `inset 0 0 0 1.5px ${outline}` } : (style ?? {});

  return (
    <div
      ref={ref}
      className="ld-card"
      style={cardStyle}
      data-selected={selected ? "true" : "false"}
      data-muted={muted ? "true" : undefined}
      data-changed={changed ? "true" : undefined}
      data-needs-amazon={needsAmazon ? "true" : undefined}
      role="button"
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={() => onSelect(lead)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(lead);
        }
      }}
      title={`${identity} — ${fmtDateShort(lead.leadAt)}${muted ? ` · ${muted}` : ""}${needsAmazon ? " · Amazon not connected" : ""}`}
    >
      {isRecentLead(lead) && <span className="ld-card-new-dot" style={{ background: stageColorVar(lead.stage) }} />}
      <div className="ld-card-line1">
        {isHotLead(lead) && <Star size={13} className="ld-hot-star" aria-label="Hot lead" />}
        {needsAmazon && (
          <AlertTriangle size={13} className="ld-needs-amazon" aria-label="Amazon not connected" />
        )}
        <span className="ld-card-name">{identity}</span>
        {lastCall && (
          <span
            className="ld-called-icon"
            data-connected={lastCall.connected ? "true" : "false"}
            title={lastCall.connected ? "Called" : "Called, no answer"}
            aria-label={lastCall.connected ? "Called" : "Called, no answer"}
          >
            <Phone size={10} strokeWidth={2.5} aria-hidden="true" />
          </span>
        )}
        <SourceLogo source={lead.firstSource} />
        {lead.convertedVia && lead.convertedVia !== lead.firstSource && (
          <span className="ld-via" title={`First came from ${SOURCE_LABELS[lead.firstSource]}, converted via ${SOURCE_LABELS[lead.convertedVia]}`}>
            →<SourceLogo source={lead.convertedVia} />
          </span>
        )}
        {lead.stripeOnly && <span className="ld-tag" title="Paying in Stripe under an email no account matches">Stripe only</span>}
        {lead.tags.includes("private-client") && <span className="ld-tag">Private client</span>}
        {lead.sellerType !== "unknown" && <span className="ld-tag">{SELLER_TYPE_LABELS[lead.sellerType]}</span>}
        {muted && <span className="ld-tag ld-tag-muted">{muted}</span>}
      </div>
      <div className="ld-card-line2">
        {age != null && (
          <span className="ld-time-tag" title={`Lead since ${fmtDateShort(lead.leadAt)} (${fmtDuration(age)} ago)`}>
            {fmtDuration(age)}
          </span>
        )}
        {jump && (
          <span className="ld-time-tag ld-time-tag-jump" style={{ ["--jump" as string]: stageColorVar(lead.stage) }} title={jump.title}>
            → {jump.label}
          </span>
        )}
        {total != null && (
          <span className="ld-time-tag ld-time-tag-total" title={`Lead to paid in ${fmtDuration(total)}`}>
            Σ {fmtDuration(total)}
          </span>
        )}
        {lastCall && (
          <span className="ld-time-tag ld-call-tag" data-interest={lastCall.summary?.interest ?? "none"} title="Last call">
            <Phone size={9} aria-hidden="true" />
            {sinceLabel(lastCall.startedAt)} · {formatDurationShort(lastCall.durationSec)}
          </span>
        )}
        <span className="ld-card-line2-text">{line2Parts.join(" · ")}</span>
      </div>
    </div>
  );
});

export default LeadCard;
