/**
 * Lifetime value per customer email, read straight from Stripe's charge
 * history. Lives apart from dashboard/stripe.ts because that file looks up one
 * email at a time (and caps at 100 charges), while attributing ad spend to
 * revenue needs every customer's full payment history in one pass.
 */

export interface CustomerValue {
  email: string;
  /** Net dollars paid across all charges (charged minus refunded). */
  totalPaid: number;
  /** Dollars refunded across all of their charges. */
  refunded: number;
  /** ISO time of their first net-positive charge. */
  firstPaidAt: string | null;
  /** ISO time of their latest net-positive charge. */
  lastPaidAt: string | null;
  /** Distinct UTC calendar months containing a net-positive charge. */
  monthsPaid: number;
  /** Net dollars paid within 30 days of the first net-positive charge. */
  paid30: number;
  paid60: number;
  paid90: number;
  /** Count of net-positive charges. */
  charges: number;
}

const CACHE_MS = 30 * 60 * 1000;
const DAY_SECONDS = 24 * 60 * 60;

// Sums of dollar floats drift (7340.799999999999), so totals are rounded to cents.
const cents = (n: number) => Math.round(n * 100) / 100;

// Stripe returns customer as an id, an expanded object, or a deleted stub, so
// every field is optional and read defensively.
interface StripeChargeRow {
  id: string;
  created: number;
  amount: number;
  amount_refunded: number;
  receipt_email?: string | null;
  billing_details?: { email?: string | null } | null;
  customer?: string | { deleted?: boolean; email?: string | null } | null;
}

interface StripeChargeList {
  data: StripeChargeRow[];
  has_more: boolean;
  error?: { message?: string };
}

let cached: { at: number; value: { byEmail: Map<string, CustomerValue> } } | null = null;

/** Customer email first (what Apex keys leads on), then the card's billing email, then the receipt email. */
function emailOf(charge: StripeChargeRow): string | null {
  const customerEmail =
    charge.customer && typeof charge.customer === "object" && !charge.customer.deleted ? charge.customer.email : null;
  const raw = customerEmail || charge.billing_details?.email || charge.receipt_email;
  const email = raw?.trim().toLowerCase();
  return email || null;
}

/**
 * Pages every succeeded charge (Stripe returns newest first). Sequential on purpose: one request at a time stays far under the rate limit.
 */
async function fetchAllCharges(secretKey: string): Promise<StripeChargeRow[]> {
  const all: StripeChargeRow[] = [];
  let startingAfter: string | null = null;

  for (;;) {
    const params = new URLSearchParams({ limit: "100", status: "succeeded" });
    params.append("expand[]", "data.customer");
    if (startingAfter) params.set("starting_after", startingAfter);

    const res = await fetch(`https://api.stripe.com/v1/charges?${params.toString()}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    });
    const json = (await res.json()) as StripeChargeList;
    if (!res.ok || json.error) {
      throw new Error(`Stripe charges failed: ${json.error?.message ?? res.status}`);
    }

    all.push(...json.data);
    if (!json.has_more || json.data.length === 0) break;
    startingAfter = json.data[json.data.length - 1].id;
  }

  return all;
}

/**
 * Net lifetime value for every Stripe customer, keyed by lowercased email.
 * Cached for 30 minutes because walking the full charge history takes a while
 * and the numbers only drift slowly. Never throws: a missing key or a Stripe
 * failure comes back as an empty map plus `error`.
 */
export async function getCustomerValues(
  fresh = false,
): Promise<{ byEmail: Map<string, CustomerValue>; error?: string }> {
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return { byEmail: new Map(), error: "STRIPE_SECRET_KEY is not set" };

  try {
    const charges = await fetchAllCharges(secretKey);

    // Gather per email first: the 30/60/90 windows hang off each customer's
    // first payment, which is only known once all their charges are in.
    const perEmail = new Map<string, { refunded: number; paid: { at: number; net: number }[] }>();
    for (const charge of charges) {
      const email = emailOf(charge);
      if (!email) continue;
      const entry = perEmail.get(email) ?? { refunded: 0, paid: [] };
      entry.refunded += charge.amount_refunded / 100;
      const net = (charge.amount - charge.amount_refunded) / 100;
      if (net > 0) entry.paid.push({ at: charge.created, net });
      perEmail.set(email, entry);
    }

    const byEmail = new Map<string, CustomerValue>();
    for (const [email, entry] of perEmail) {
      const paid = entry.paid.sort((a, b) => a.at - b.at);
      const first = paid[0]?.at ?? null;
      const last = paid[paid.length - 1]?.at ?? null;
      const within = (days: number) =>
        first == null ? 0 : paid.filter((p) => p.at <= first + days * DAY_SECONDS).reduce((s, p) => s + p.net, 0);
      const months = new Set(paid.map((p) => new Date(p.at * 1000).toISOString().slice(0, 7)));

      byEmail.set(email, {
        email,
        totalPaid: cents(paid.reduce((s, p) => s + p.net, 0)),
        refunded: cents(entry.refunded),
        firstPaidAt: first == null ? null : new Date(first * 1000).toISOString(),
        lastPaidAt: last == null ? null : new Date(last * 1000).toISOString(),
        monthsPaid: months.size,
        paid30: cents(within(30)),
        paid60: cents(within(60)),
        paid90: cents(within(90)),
        charges: paid.length,
      });
    }

    const value = { byEmail };
    cached = { at: Date.now(), value };
    return value;
  } catch (err) {
    // Not cached, so the next call retries instead of serving an empty map for 30 minutes.
    return { byEmail: new Map(), error: err instanceof Error ? err.message : "Failed to reach Stripe" };
  }
}
