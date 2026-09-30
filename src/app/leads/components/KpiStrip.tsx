"use client";

import { useMemo } from "react";
import type { ActivationTier, Lead } from "../../../lib/leads/model";
import { ACTIVATION_COLORS, ACTIVATION_LABELS } from "./shared";

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function pctLabel(v: number | null): string {
  return v == null ? "—" : `${v}%`;
}

function parseGoalMonth(goalMonth: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(goalMonth);
  if (!match) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

function computeGoal(leads: Lead[], goal: number, goalMonth: string) {
  const { year, month } = parseGoalMonth(goalMonth);
  const monthStart = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const hasStarted = now >= monthStart;
  if (!hasStarted) return { achieved: 0, hasStarted: false, runRate: goal / daysInMonth, monthStart };

  const inThisMonth = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === year && d.getMonth() === month;
  };
  const achieved = leads.filter((l) => inThisMonth(l.trialStartedAt) || inThisMonth(l.customerSince)).length;
  const monthEnd = new Date(year, month + 1, 0);
  const today = now > monthEnd ? monthEnd : now;
  const daysLeft = Math.max(0, daysInMonth - today.getDate() + 1);
  const remaining = Math.max(0, goal - achieved);
  const runRate = daysLeft > 0 ? remaining / daysLeft : remaining;
  return { achieved, hasStarted: true, runRate, monthStart };
}

function monthKey(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function Tile({
  label,
  value,
  small,
  tooltip,
}: {
  label: string;
  value: string | number;
  small?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="ld-kpi-tile">
      <div className="ld-kpi-label">{label}</div>
      <div className={`ld-kpi-value ${small ? "ld-kpi-value-sm" : ""}`}>{value}</div>
      {tooltip && <div className="ld-kpi-tooltip">{tooltip}</div>}
    </div>
  );
}

/** Legend order runs low milestone to high, matching the priority a card/row border is picked by (see model.ts activationTier). */
const LEGEND_TIERS: ActivationTier[] = ["emailed", "scanned", "database", "connected"];

function ActivationLegend() {
  return (
    <div className="ld-kpi-legend">
      {LEGEND_TIERS.map((tier) => (
        <span key={tier} className="ld-kpi-legend-item">
          <span className="ld-kpi-legend-swatch" style={{ background: ACTIVATION_COLORS[tier] }} />
          {ACTIVATION_LABELS[tier]}
        </span>
      ))}
    </div>
  );
}

export default function KpiStrip({
  leads,
  goalTrials,
  goalMonth,
}: {
  leads: Lead[];
  goalTrials: number;
  goalMonth: string;
}) {
  const stats = useMemo(() => {
    const total = leads.length;
    const counts = { lead: 0, registered: 0, trial: 0, customer: 0, churned: 0 };
    for (const l of leads) counts[l.stage] += 1;
    const registeredPlus = total - counts.lead;
    const trialPlus = counts.trial + counts.customer + counts.churned;
    const customerPlus = counts.customer + counts.churned;

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;
    let churnedThisMonth = 0;
    let churnedLastMonth = 0;
    for (const l of leads) {
      const k = monthKey(l.churnedAt);
      if (k === thisMonthKey) churnedThisMonth += 1;
      else if (k === lastMonthKey) churnedLastMonth += 1;
    }

    return {
      total,
      counts,
      leadToAccountPct: pct(registeredPlus, total),
      accountToTrialPct: pct(trialPlus, registeredPlus),
      trialToPaidPct: pct(customerPlus, trialPlus),
      churnPct: pct(counts.churned, customerPlus),
      churnedThisMonth,
      churnedLastMonth,
    };
  }, [leads]);

  const goal = useMemo(() => computeGoal(leads, goalTrials, goalMonth), [leads, goalTrials, goalMonth]);
  const goalPct = goalTrials > 0 ? Math.min(100, Math.round((goal.achieved / goalTrials) * 100)) : 0;

  return (
    <div className="ld-kpi-strip">
      <Tile label="Leads" value={stats.total} />
      <Tile label="Accounts" value={stats.counts.registered} />
      <Tile label="Trialing" value={stats.counts.trial} />
      <Tile label="Customers" value={stats.counts.customer} />
      <Tile label="Churned" value={stats.counts.churned} />
      <Tile label="Lead→Acct" value={pctLabel(stats.leadToAccountPct)} small />
      <Tile label="Acct→Trial" value={pctLabel(stats.accountToTrialPct)} small />
      <Tile label="Trial→Paid" value={pctLabel(stats.trialToPaidPct)} small />
      <Tile
        label="Churn %"
        value={pctLabel(stats.churnPct)}
        small
        tooltip={`${stats.churnedThisMonth} churned this month · ${stats.churnedLastMonth} last month`}
      />
      <div className="ld-kpi-tile ld-kpi-goal">
        <div className="ld-kpi-label">Goal</div>
        {goal.hasStarted ? (
          <>
            <div className="ld-kpi-value ld-kpi-value-sm">
              {goal.achieved} / {goalTrials} · {goal.runRate.toFixed(1)}/day needed
            </div>
            <div className="ld-kpi-goal-bar">
              <div style={{ width: `${goalPct}%` }} />
            </div>
          </>
        ) : (
          <div className="ld-kpi-value ld-kpi-value-sm">Starts {goal.monthStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
        )}
      </div>
      <ActivationLegend />
    </div>
  );
}
