"use client";

import { forwardRef } from "react";
import type { Lead } from "../../../lib/leads/model";
import { activationTier } from "../../../lib/leads/model";
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
  style?: React.CSSProperties;
  onSelect: (lead: Lead) => void;
  tabIndex: number;
  onFocus?: () => void;
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
  { lead, selected, style, onSelect, tabIndex, onFocus },
  ref,
) {
  const identity = lead.name || lead.email || "Unknown";
  const suffix = stageSuffix(lead);
  const line2Parts = [lastOutreachLabel(lead.lastOutreachAt)];
  if (suffix) line2Parts.push(suffix);
  const age = leadAgeMs(lead);
  const jump = stageJump(lead);
  const total = lead.stage === "customer" ? leadToPaidMs(lead) : null;

  const tier = activationTier(lead.activation);
  const cardStyle: React.CSSProperties = tier
    ? { ...style, boxShadow: `inset 0 0 0 1.5px ${ACTIVATION_COLORS[tier]}` }
    : (style ?? {});

  return (
    <div
      ref={ref}
      className="ld-card"
      style={cardStyle}
      data-selected={selected ? "true" : "false"}
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
      title={`${identity} — ${fmtDateShort(lead.leadAt)}`}
    >
      {isRecentLead(lead) && <span className="ld-card-new-dot" style={{ background: stageColorVar(lead.stage) }} />}
      <div className="ld-card-line1">
        <span className="ld-card-name">{identity}</span>
        <SourceLogo source={lead.firstSource} />
        {lead.convertedVia && lead.convertedVia !== lead.firstSource && (
          <span className="ld-via" title={`First came from ${SOURCE_LABELS[lead.firstSource]}, converted via ${SOURCE_LABELS[lead.convertedVia]}`}>
            →<SourceLogo source={lead.convertedVia} />
          </span>
        )}
        {lead.stripeOnly && <span className="ld-tag" title="Paying in Stripe under an email no account matches">Stripe only</span>}
        {lead.tags.includes("private-client") && <span className="ld-tag">Private client</span>}
        {lead.sellerType !== "unknown" && <span className="ld-tag">{SELLER_TYPE_LABELS[lead.sellerType]}</span>}
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
        <span className="ld-card-line2-text">{line2Parts.join(" · ")}</span>
      </div>
    </div>
  );
});

export default LeadCard;
