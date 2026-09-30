"use client";

/**
 * Full-width strip under the two funnel cards: every source (not just the
 * two the cards show) in one compact table, sorted by customers. The best
 * lead-to-paid % and the lowest cost-per-customer get a subtle highlight.
 */

import type { Lead } from "../../../lib/leads/model";
import { sourceLeaderboard, SPEND } from "../../../lib/leads/funnel";
import { fmtInt, money, SOURCE_LABELS } from "./shared";
import SourceLogo from "./SourceLogo";

export default function SourceLeaderboard({ cohort, rangeStart, rangeEnd }: { cohort: Lead[]; rangeStart: Date; rangeEnd: Date }) {
  const rows = sourceLeaderboard(cohort, SPEND, rangeStart, rangeEnd);

  if (rows.length === 0) {
    return (
      <div className="ld-funnel-leaderboard">
        <div className="ld-funnel-leaderboard-title">Where the best customers came from</div>
        <div className="ld-funnel-leaderboard-empty">No leads in this range.</div>
      </div>
    );
  }

  const bestPct = Math.max(...rows.map((r) => (r.leadToPaidPct == null ? -Infinity : r.leadToPaidPct)));
  const costedRows = rows.filter((r) => r.costPerCustomer != null);
  const bestCost = costedRows.length ? Math.min(...costedRows.map((r) => r.costPerCustomer as number)) : null;

  return (
    <div className="ld-funnel-leaderboard">
      <div className="ld-funnel-leaderboard-title">Where the best customers came from</div>
      <table className="ld-funnel-leaderboard-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Leads</th>
            <th>Customers</th>
            <th>Lead to paid %</th>
            <th>MRR</th>
            <th>Avg MRR</th>
            <th>Median days to paid</th>
            <th>Cost per customer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.source}>
              <td className="ld-funnel-leaderboard-source">
                <SourceLogo source={row.source} />
                {SOURCE_LABELS[row.source]}
              </td>
              <td>{fmtInt(row.leads)}</td>
              <td>{fmtInt(row.customers)}</td>
              <td data-best={row.leadToPaidPct != null && row.leadToPaidPct === bestPct}>
                {row.leadToPaidPct == null ? "—" : `${row.leadToPaidPct.toFixed(1)}%`}
              </td>
              <td>{money(row.mrr)}</td>
              <td>{row.avgMrr == null ? "—" : money(row.avgMrr)}</td>
              <td>
                {row.medianDaysToPaid.medianDays == null ? "—" : `${Math.round(row.medianDaysToPaid.medianDays)}d`}{" "}
                <span className="ld-funnel-cycle-n">(n={fmtInt(row.medianDaysToPaid.n)})</span>
              </td>
              <td data-best={bestCost != null && row.costPerCustomer === bestCost}>
                {row.costPerCustomer != null ? money(row.costPerCustomer) : row.spendRecorded ? "—" : "n/a"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
