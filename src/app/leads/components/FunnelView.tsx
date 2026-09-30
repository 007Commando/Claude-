"use client";

/**
 * The Funnels view: two side-by-side funnel cards (PrimeWell vs Facebook by
 * default, either side switchable) plus a full-width "best customers"
 * leaderboard below. Only the lead date range and seller type top-bar
 * filters apply here — search, the source multi-select and the ASH toggle
 * are ignored (see applyTopBarFilters in ../../../lib/leads/funnel.ts), so
 * `leads` should be the *unfiltered* list from LeadDesk, not the one already
 * run through filterLeads for Board/Table.
 */

import { useMemo, useState } from "react";
import type { Lead, LeadSource, Stage } from "../../../lib/leads/model";
import { DATE_PRESET_OPTIONS, dateWindow, type LeadDatePreset, type LeadFilters } from "./useLeadFilters";
import {
  applyTopBarFilters,
  resolveSpendRange,
  DEFAULT_LEFT_SOURCE,
  DEFAULT_RIGHT_SOURCE,
  type FunnelSourceKey,
} from "../../../lib/leads/funnel";
import FunnelCard from "./FunnelCard";
import SourceLeaderboard from "./SourceLeaderboard";

const FUNNEL_PERIODS: { value: LeadDatePreset; short: string }[] = [
  { value: "7d", short: "7 days" },
  { value: "14d", short: "14 days" },
  { value: "30d", short: "30 days" },
  { value: "45d", short: "45 days" },
  { value: "60d", short: "60 days" },
  { value: "90d", short: "90 days" },
  { value: "all", short: "All time" },
];

export default function FunnelView({ leads, filters }: { leads: Lead[]; filters: LeadFilters }) {
  const [leftKey, setLeftKey] = useState<FunnelSourceKey>(DEFAULT_LEFT_SOURCE);
  const [rightKey, setRightKey] = useState<FunnelSourceKey>(DEFAULT_RIGHT_SOURCE);

  const window = useMemo(
    () => dateWindow(filters.datePreset, filters.from, filters.to),
    [filters.datePreset, filters.from, filters.to],
  );

  const cohort = useMemo(
    () => applyTopBarFilters(leads, filters.sellerType, window.from, window.to),
    // filters.sellerType is a fresh array each render (derived from the URL) — its joined value is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, filters.sellerType.join(","), window.from, window.to],
  );

  const { start, end } = useMemo(() => resolveSpendRange(window.from, window.to, cohort), [window.from, window.to, cohort]);

  const onStageClick = (sources: LeadSource[], stage: Stage) => filters.goToStageInTable(sources, stage);

  return (
    <div className="ld-funnels">
      <div className="ld-funnels-period">
        <span className="ld-funnels-period-label">Leads created</span>
        <div className="ld-view-switch" role="tablist" aria-label="Period">
          {FUNNEL_PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="tab"
              aria-selected={filters.datePreset === p.value}
              data-active={filters.datePreset === p.value}
              onClick={() => filters.setDatePreset(p.value)}
            >
              {p.short}
            </button>
          ))}
        </div>
        {filters.datePreset === "custom" && (
          <span className="ld-funnels-period-note">
            {DATE_PRESET_OPTIONS.find((o) => o.value === "custom")?.label}: set dates in the top bar
          </span>
        )}
      </div>
      <div className="ld-funnels-grid">
        <FunnelCard cohort={cohort} selectedKey={leftKey} onChangeKey={setLeftKey} rangeStart={start} rangeEnd={end} onStageClick={onStageClick} />
        <FunnelCard cohort={cohort} selectedKey={rightKey} onChangeKey={setRightKey} rangeStart={start} rangeEnd={end} onStageClick={onStageClick} />
      </div>
      <SourceLeaderboard cohort={cohort} rangeStart={start} rangeEnd={end} />
    </div>
  );
}
