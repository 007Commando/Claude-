"use client";

/**
 * One side of the Funnels view: a header with a source-picking select, the
 * trapezoid funnel graphic, and a compact stats block (overall conversion,
 * cost per stage, sales-cycle medians, revenue). All the numbers come from
 * the pure helpers in ../../../lib/leads/funnel.ts — this file only renders.
 */

import type { Lead, LeadSource, Stage } from "../../../lib/leads/model";
import {
  costBreakdown,
  facebookSplitFraction,
  filterBySourceKey,
  funnelCounts,
  funnelSourceOption,
  overallConversionPct,
  representativeSource,
  revenueStat,
  salesCycle,
  SPEND,
  FUNNEL_SOURCE_OPTIONS,
  type CycleStat,
  type FunnelSourceKey,
  type SalesCycle,
} from "../../../lib/leads/funnel";
import { fmtInt, money, moneyPrecise } from "./shared";
import SourceLogo from "./SourceLogo";
import FunnelGraphic from "./FunnelGraphic";

const CYCLE_ROWS: { key: keyof SalesCycle; label: string }[] = [
  { key: "leadToAccount", label: "Lead to account" },
  { key: "accountToTrial", label: "Account to trial" },
  { key: "trialToPaid", label: "Trial to paid" },
  { key: "leadToPaid", label: "Lead to paid" },
];

function cycleLabel(stat: CycleStat): string {
  return stat.medianDays == null ? "—" : `${Math.round(stat.medianDays)}d`;
}

export default function FunnelCard({
  cohort,
  selectedKey,
  onChangeKey,
  rangeStart,
  rangeEnd,
  onStageClick,
}: {
  /** Leads already narrowed to the cohort (lead date range + seller type) — not yet split by source. */
  cohort: Lead[];
  selectedKey: FunnelSourceKey;
  onChangeKey: (key: FunnelSourceKey) => void;
  rangeStart: Date;
  rangeEnd: Date;
  onStageClick: (sources: LeadSource[], stage: Stage) => void;
}) {
  const option = funnelSourceOption(selectedKey);
  const sourceLeads = filterBySourceKey(cohort, selectedKey);
  const counts = funnelCounts(sourceLeads);
  const fbFraction = facebookSplitFraction(option, cohort);
  const cost = costBreakdown(option, counts, SPEND, rangeStart, rangeEnd, fbFraction);
  const cycle = salesCycle(sourceLeads);
  const revenue = revenueStat(sourceLeads);
  const overallPct = overallConversionPct(counts);

  return (
    <div className="ld-funnel-card">
      <div className="ld-funnel-card-header">
        <SourceLogo source={representativeSource(option)} />
        <span className="ld-funnel-card-title">{option.label}</span>
        <select
          className="ld-funnel-card-select"
          value={selectedKey}
          onChange={(e) => onChangeKey(e.target.value as FunnelSourceKey)}
          aria-label="Change source"
        >
          {FUNNEL_SOURCE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <FunnelGraphic
        option={option}
        counts={counts}
        onStageClick={(step) => onStageClick(option.sources, step.stage)}
      />

      <div className="ld-funnel-stats">
        <div className="ld-funnel-stat-row ld-funnel-stat-headline">
          <span className="ld-funnel-stat-label">Lead to paying</span>
          <span className="ld-funnel-stat-value">{overallPct == null ? "—" : `${overallPct.toFixed(1)}%`}</span>
        </div>

        {!cost.recorded ? (
          <div className="ld-funnel-cost-unrecorded">Spend not recorded</div>
        ) : (
          <div className="ld-funnel-cost-grid">
            <div className="ld-funnel-cost-item">
              <span className="ld-funnel-cost-label">Per lead</span>
              <span className="ld-funnel-cost-value">{cost.perLead == null ? "—" : moneyPrecise(cost.perLead)}</span>
            </div>
            <div className="ld-funnel-cost-item">
              <span className="ld-funnel-cost-label">Per account</span>
              <span className="ld-funnel-cost-value">{cost.perAccount == null ? "—" : money(cost.perAccount)}</span>
            </div>
            <div className="ld-funnel-cost-item">
              <span className="ld-funnel-cost-label">Per trial</span>
              <span className="ld-funnel-cost-value">{cost.perTrial == null ? "—" : money(cost.perTrial)}</span>
            </div>
            <div className="ld-funnel-cost-item">
              <span className="ld-funnel-cost-label">Per customer</span>
              <span className="ld-funnel-cost-value">{cost.perCustomer == null ? "—" : money(cost.perCustomer)}</span>
            </div>
          </div>
        )}

        <div className="ld-funnel-cycle">
          {CYCLE_ROWS.map((row) => {
            const stat = cycle[row.key];
            return (
              <div key={row.key} className="ld-funnel-cycle-row">
                <span className="ld-funnel-cycle-label">{row.label}</span>
                <span className="ld-funnel-cycle-value">
                  {cycleLabel(stat)} <span className="ld-funnel-cycle-n">(n={fmtInt(stat.n)})</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="ld-funnel-stat-row">
          <span className="ld-funnel-stat-label">Revenue</span>
          <span className="ld-funnel-stat-value ld-funnel-stat-value-sm">
            {money(revenue.totalMrr)} MRR · {revenue.avgMrr == null ? "—" : money(revenue.avgMrr)} avg/customer
          </span>
        </div>
      </div>
    </div>
  );
}
