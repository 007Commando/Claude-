/**
 * Commissions on yearly deals sold through a rep link. Pure types and
 * arithmetic, so client components can import it; the Stripe read lives in
 * stripeCommissions.ts.
 */

export const COMMISSION_RATE = 0.25;
/** A deal is payable once it is this many days old (the refund window). */
export const PAYABLE_AFTER_DAYS = 30;

export interface CommissionRow {
  subscriptionId: string;
  rep: string;
  customerEmail: string | null;
  plan: string;
  /** Pre-tax dollars for the year. */
  amount: number;
  createdAt: string;
  status: string;
  commission: number;
  paidOut: boolean;
}

export interface CommissionsResponse {
  rows: CommissionRow[];
  error?: string;
}

/** Only active subscriptions earn commission: canceled, past due, unpaid and still-incomplete ones do not. */
export function countsForCommission(row: Pick<CommissionRow, "status">): boolean {
  return row.status === "active";
}

/** Canceled or in trouble: shown greyed with the commission struck through. */
export function isLapsed(row: Pick<CommissionRow, "status">): boolean {
  return ["canceled", "past_due", "unpaid", "incomplete_expired"].includes(row.status);
}

export interface RepTotals {
  rep: string;
  rows: CommissionRow[];
  total: number;
  pending: number;
  payable: number;
}

const cents = (n: number) => Math.round(n * 100) / 100;

/** Rows grouped by rep (newest deal first inside a rep), with the active total and the pending and payable split. */
export function groupByRep(rows: CommissionRow[], now: number = Date.now()): RepTotals[] {
  const cutoff = now - PAYABLE_AFTER_DAYS * 86_400_000;
  const groups = new Map<string, RepTotals>();
  for (const row of rows) {
    let g = groups.get(row.rep);
    if (!g) {
      g = { rep: row.rep, rows: [], total: 0, pending: 0, payable: 0 };
      groups.set(row.rep, g);
    }
    g.rows.push(row);
    if (!countsForCommission(row)) continue;
    g.total += row.commission;
    if (new Date(row.createdAt).getTime() <= cutoff) g.payable += row.commission;
    else g.pending += row.commission;
  }
  const out = [...groups.values()];
  for (const g of out) {
    g.rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    g.total = cents(g.total);
    g.pending = cents(g.pending);
    g.payable = cents(g.payable);
  }
  return out.sort((a, b) => a.rep.localeCompare(b.rep));
}
