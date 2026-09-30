"use client";

import { forwardRef } from "react";
import type { Lead } from "../../../lib/leads/model";
import { activationTier } from "../../../lib/leads/model";
import {
  ACTIVATION_COLORS,
  SELLER_TYPE_LABELS,
  daysInStageLabel,
  fmtDateShort,
  isRecentLead,
  lastOutreachLabel,
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
  const line2Parts = [daysInStageLabel(lead), lastOutreachLabel(lead.lastOutreachAt)];
  if (suffix) line2Parts.push(suffix);

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
        <SourceLogo source={lead.source} />
        {lead.sellerType !== "unknown" && <span className="ld-tag">{SELLER_TYPE_LABELS[lead.sellerType]}</span>}
      </div>
      <div className="ld-card-line2">{line2Parts.join(" · ")}</div>
    </div>
  );
});

export default LeadCard;
