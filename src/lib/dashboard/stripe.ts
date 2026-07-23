import Stripe from "stripe";
import type { StripeMetrics } from "./types";

// maxNetworkRetries turns on the SDK's built-in exponential-backoff retry for
// transient errors, including 429s — measured empirically to be necessary:
// without it, batches of concurrent lookups reliably hit Stripe's rate limit
// and silently drop the majority of results (see lookupStripeCustomersByEmail).
function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { maxNetworkRetries: 3 });
}

// Fetched once per call site, not per-customer: Stripe caps expand depth at 4
// levels, too shallow to reach price.product from a subscription list
// response, so product names are resolved via this map instead of expand.
async function getProductNameMap(stripe: Stripe): Promise<Map<string, string>> {
  const productNameById = new Map<string, string>();
  try {
    const products = await stripe.products.list({ limit: 100, active: true });
    for (const product of products.data) productNameById.set(product.id, product.name);
  } catch {
    // Plan names just won't resolve — not fatal to the rest of the lookup.
  }
  return productNameById;
}

// MRR here means real monthly-billed cash, not an annualized run-rate — a
// $1,497/year subscription doesn't put $124.75 in the bank this month, so it
// doesn't count. Annual-interval items are excluded and rolled into ARR
// instead (see annualAmount). Sub-monthly intervals (week/day) are still
// normalized to a monthly figure since those genuinely do recur within the month.
function monthlyAmount(item: Stripe.SubscriptionItem): number {
  const amount = (item.price.unit_amount ?? 0) * (item.quantity ?? 1);
  const interval = item.price.recurring?.interval;
  const intervalCount = item.price.recurring?.interval_count ?? 1;
  if (interval === "year") return 0;
  if (interval === "week") return (amount * 4.345) / intervalCount;
  if (interval === "day") return (amount * 30.44) / intervalCount;
  return amount / intervalCount;
}

// True annual amount for year-interval items only — not divided down to a
// monthly figure, since these customers already paid (or will pay) the full
// amount up front for the year.
function annualAmount(item: Stripe.SubscriptionItem): number {
  if (item.price.recurring?.interval !== "year") return 0;
  const amount = (item.price.unit_amount ?? 0) * (item.quantity ?? 1);
  const intervalCount = item.price.recurring?.interval_count ?? 1;
  return amount / intervalCount;
}

export async function getStripeMetrics(): Promise<StripeMetrics> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const empty: StripeMetrics = {
    connected: false,
    mrr: 0,
    arr: 0,
    activeSubscriptions: 0,
    newCustomers30d: 0,
    revenue7d: 0,
    revenue30d: 0,
    recentCharges: [],
    subscriptions: [],
    subscriptionsTruncated: false,
    trials: [],
    trialsTruncated: false,
    potentialMrr: 0,
    potentialArr: 0,
  };

  if (!secretKey) {
    return { ...empty, error: "STRIPE_SECRET_KEY is not set" };
  }

  try {
    const stripe = createStripeClient(secretKey);
    const now = Math.floor(Date.now() / 1000);
    const since7d = now - 7 * 24 * 60 * 60;
    const since30d = now - 30 * 24 * 60 * 60;

    const [subscriptions, trialSubscriptions, charges30d, charges7d, customers30d, productNameById] =
      await Promise.all([
        stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.customer"] }),
        stripe.subscriptions.list({ status: "trialing", limit: 100, expand: ["data.customer"] }),
        stripe.charges.list({ created: { gte: since30d }, limit: 100 }),
        stripe.charges.list({ created: { gte: since7d }, limit: 100 }),
        stripe.customers.list({ created: { gte: since30d }, limit: 100 }),
        getProductNameMap(stripe),
      ]);

    const mrr = subscriptions.data.reduce((sum, sub) => {
      const itemTotal = sub.items.data.reduce((itemSum, item) => itemSum + monthlyAmount(item), 0);
      return sum + itemTotal;
    }, 0);

    const arr = subscriptions.data.reduce((sum, sub) => {
      const itemTotal = sub.items.data.reduce((itemSum, item) => itemSum + annualAmount(item), 0);
      return sum + itemTotal;
    }, 0);

    const sumCharges = (list: Stripe.Charge[]) =>
      list.filter((c) => c.paid && !c.refunded).reduce((sum, c) => sum + c.amount, 0) / 100;

    return {
      connected: true,
      mrr: mrr / 100,
      arr: arr / 100,
      activeSubscriptions: subscriptions.data.length,
      newCustomers30d: customers30d.data.length,
      revenue7d: sumCharges(charges7d.data),
      revenue30d: sumCharges(charges30d.data),
      recentCharges: charges30d.data
        .filter((c) => c.paid && !c.refunded)
        .slice(0, 8)
        .map((c) => ({
          id: c.id,
          amount: c.amount / 100,
          customerEmail: c.billing_details?.email ?? null,
          created: c.created,
        })),
      subscriptions: subscriptions.data.map((sub) => {
        const customer = sub.customer;
        const planItem = sub.items.data[0];
        const productId = typeof planItem?.price.product === "string" ? planItem.price.product : undefined;
        const planName = planItem?.price.nickname ?? (productId && productNameById.get(productId)) ?? "—";
        const monthlyTotal = sub.items.data.reduce((sum, item) => sum + monthlyAmount(item), 0);
        const annualTotal = sub.items.data.reduce((sum, item) => sum + annualAmount(item), 0);
        return {
          id: sub.id,
          customerName:
            (customer && typeof customer === "object" && !customer.deleted ? customer.name : null) ?? null,
          customerEmail: customer && typeof customer === "object" && !customer.deleted ? customer.email : null,
          planName,
          interval: planItem?.price.recurring?.interval ?? null,
          amount: (planItem?.price.unit_amount ?? 0) / 100,
          mrrContribution: monthlyTotal / 100,
          arrContribution: annualTotal / 100,
          status: sub.status,
          startedAt: new Date(sub.start_date * 1000).toISOString(),
          // Stripe moved current_period_end to the item level (each item can
          // have its own billing cycle) — using the first item, consistent
          // with how planName/interval are already derived from it above.
          nextInvoiceAt: planItem ? new Date(planItem.current_period_end * 1000).toISOString() : null,
          // Enriched in the summary route by cross-referencing GHL emails —
          // this file has no knowledge of lead sources.
          source: "unknown" as const,
        };
      }),
      subscriptionsTruncated: subscriptions.data.length >= 100,
      trials: trialSubscriptions.data.map((sub) => {
        const customer = sub.customer;
        const planItem = sub.items.data[0];
        const productId = typeof planItem?.price.product === "string" ? planItem.price.product : undefined;
        const planName = planItem?.price.nickname ?? (productId && productNameById.get(productId)) ?? "—";
        const monthlyTotal = sub.items.data.reduce((sum, item) => sum + monthlyAmount(item), 0);
        const annualTotal = sub.items.data.reduce((sum, item) => sum + annualAmount(item), 0);
        return {
          id: sub.id,
          customerName:
            (customer && typeof customer === "object" && !customer.deleted ? customer.name : null) ?? null,
          customerEmail: customer && typeof customer === "object" && !customer.deleted ? customer.email : null,
          planName,
          interval: planItem?.price.recurring?.interval ?? null,
          amount: (planItem?.price.unit_amount ?? 0) / 100,
          predictedMrrContribution: monthlyTotal / 100,
          predictedArrContribution: annualTotal / 100,
          trialStartAt: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
          trialEndAt: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          // Enriched in the summary route by cross-referencing GHL emails —
          // this file has no knowledge of lead sources.
          source: "unknown" as const,
        };
      }),
      trialsTruncated: trialSubscriptions.data.length >= 100,
      potentialMrr:
        trialSubscriptions.data.reduce(
          (sum, sub) => sum + sub.items.data.reduce((s, item) => s + monthlyAmount(item), 0),
          0,
        ) / 100,
      potentialArr:
        trialSubscriptions.data.reduce(
          (sum, sub) => sum + sub.items.data.reduce((s, item) => s + annualAmount(item), 0),
          0,
        ) / 100,
    };
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : "Failed to reach Stripe" };
  }
}

export interface StripeCustomerLookup {
  isCustomer: boolean;
  ltv: number;
  hadSubscription: boolean;
  isActiveSubscriber: boolean;
  /** ISO date of their earliest successful charge — null if they've never actually paid. */
  customerSince: string | null;
  /** Product/price name of their current active or trialing subscription, if any. */
  planName: string | null;
}

/** Looks up Stripe customer status per email, bounded to a few concurrent requests. */
export async function lookupStripeCustomersByEmail(
  emails: string[],
): Promise<Map<string, StripeCustomerLookup>> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const result = new Map<string, StripeCustomerLookup>();
  const uniqueEmails = [...new Set(emails)];
  if (!secretKey || uniqueEmails.length === 0) return result;

  const stripe = createStripeClient(secretKey);
  const productNameById = await getProductNameMap(stripe);

  // Empirically tuned: concurrency above ~5 reliably triggers Stripe rate
  // limiting for this account, even with maxNetworkRetries — at 8-20
  // concurrent workers, 15-65% of lookups silently failed (measured against
  // ~1000 real emails). 5 concurrent workers produced zero errors.
  const CONCURRENCY = 5;
  let cursor = 0;

  async function worker() {
    while (cursor < uniqueEmails.length) {
      const email = uniqueEmails[cursor++];
      try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        const customer = customers.data[0];
        if (!customer) continue;

        const [charges, subscriptions] = await Promise.all([
          stripe.charges.list({ customer: customer.id, limit: 100 }),
          stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 20 }),
        ]);

        const paidCharges = charges.data.filter((c) => c.paid && !c.refunded);
        const ltv = paidCharges.reduce((sum, c) => sum + c.amount, 0) / 100;
        const hadSubscription = subscriptions.data.length > 0;
        const activeSub = subscriptions.data.find((s) => s.status === "active" || s.status === "trialing");
        const isActiveSubscriber = Boolean(activeSub);

        const earliestPaidCharge = paidCharges.reduce<Stripe.Charge | null>(
          (earliest, c) => (!earliest || c.created < earliest.created ? c : earliest),
          null,
        );

        const planItem = activeSub?.items.data[0];
        const productId = typeof planItem?.price.product === "string" ? planItem.price.product : undefined;
        const planName = planItem?.price.nickname ?? (productId && productNameById.get(productId)) ?? null;

        result.set(email, {
          isCustomer: ltv > 0 || hadSubscription,
          ltv,
          hadSubscription,
          isActiveSubscriber,
          customerSince: earliestPaidCharge ? new Date(earliestPaidCharge.created * 1000).toISOString() : null,
          planName,
        });
      } catch (err) {
        // Skip this email on error — it's simply treated as "not a customer" downstream.
        // Logged (not thrown) so a systemic failure here is still visible in server logs
        // instead of silently under-reporting every customer, as happened previously.
        console.error(`[stripe] lookup failed for ${email}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, uniqueEmails.length) }, worker));
  return result;
}
