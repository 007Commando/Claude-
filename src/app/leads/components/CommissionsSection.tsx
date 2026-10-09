"use client";

/**
 * Commissions at the bottom of the Calls view: yearly deals sold through a
 * rep link, grouped by rep, with 25% commission on each. Read from Stripe by
 * /api/leads/commissions (cached there for five minutes).
 */

import { useEffect, useMemo, useState } from "react";
import {
  COMMISSION_RATE,
  PAYABLE_AFTER_DAYS,
  groupByRep,
  isLapsed,
  type CommissionsResponse,
} from "../../../lib/leads/commissions";
import { apiUrl, fmtDate, moneyPrecise } from "./shared";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  incomplete_expired: "Expired",
  paused: "Paused",
};

const repLabel = (rep: string) => rep.charAt(0).toUpperCase() + rep.slice(1);

export default function CommissionsSection() {
  const [data, setData] = useState<CommissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/leads/commissions"), { cache: "no-store" });
        const json = (await res.json()) as CommissionsResponse;
        if (!cancelled) setData({ rows: Array.isArray(json.rows) ? json.rows : [], error: json.error });
      } catch (err) {
        if (!cancelled) setData({ rows: [], error: err instanceof Error ? err.message : "Could not load commissions" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reps = useMemo(() => groupByRep(data?.rows ?? []), [data]);

  return (
    <section className="ld-live-block ld-cm">
      <h3>
        Commissions <span className="ld-calls-sub">· {Math.round(COMMISSION_RATE * 100)}% of yearly deals</span>
      </h3>
      {data?.error && <p className="ld-cm-error">Could not read Stripe: {data.error}</p>}
      {loading ? (
        <p className="ld-live-empty">Loading commissions…</p>
      ) : reps.length === 0 ? (
        <p className="ld-live-empty">No yearly deals with a rep yet</p>
      ) : (
        <>
          {reps.map((g) => (
            <div key={g.rep} className="ld-cm-rep">
              <div className="ld-cm-rep-head">
                <b>{repLabel(g.rep)}</b>
                <span className="ld-cm-totals">
                  <span>
                    Total <b>{moneyPrecise(g.total)}</b>
                  </span>
                  <span>
                    Pending (under {PAYABLE_AFTER_DAYS} days) <b>{moneyPrecise(g.pending)}</b>
                  </span>
                  <span>
                    Payable ({PAYABLE_AFTER_DAYS} days or older) <b>{moneyPrecise(g.payable)}</b>
                  </span>
                </span>
              </div>
              <div className="ld-app-table-wrap">
                <table className="ld-app-table ld-cm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>{Math.round(COMMISSION_RATE * 100)}% commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((row) => (
                      <tr key={row.subscriptionId} data-lapsed={isLapsed(row) ? "true" : undefined}>
                        <td>{fmtDate(row.createdAt)}</td>
                        <td>{row.customerEmail ?? "–"}</td>
                        <td>{row.plan}</td>
                        <td>{moneyPrecise(row.amount)}</td>
                        <td>{STATUS_LABELS[row.status] ?? row.status}</td>
                        <td className="ld-cm-commission">
                          <span data-struck={isLapsed(row) ? "true" : undefined}>{moneyPrecise(row.commission)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="ld-cm-note">Totals count active subscriptions only. Amounts are the yearly price before tax.</p>
        </>
      )}
    </section>
  );
}
