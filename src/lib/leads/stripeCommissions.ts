import { COMMISSION_RATE, type CommissionRow, type CommissionsResponse } from "./commissions";

/**
 * Yearly subscriptions sold through a rep link, read from Stripe. A rep link
 * stamps `metadata.rep` on the subscription. Stripe's search needs a value to
 * compare against, but it accepts negation with null, so
 * `-metadata['rep']:null` returns every subscription that has a rep (checked
 * against the live account: it returns exactly the subscriptions that carry
 * the key, and `metadata['rep']~'%'` is rejected because metadata only takes
 * `:`). If search fails, subscriptions are listed with status=all and
 * filtered by hand. Plan names come from the price nickname, else the product (one lookup per product), else metadata.plan. Cached for five minutes. Never throws.
 */

const CACHE_MS = 5 * 60 * 1000;
const MAX_PAGES = 30;
const SEARCH_QUERY = "-metadata['rep']:null";

interface StripePrice {
  id: string;
  nickname?: string | null;
  unit_amount?: number | null;
  unit_amount_decimal?: string | null;
  recurring?: { interval?: string | null } | null;
  /** An id: Stripe will not expand the product from a subscription search (four levels at most). */
  product?: string | { id?: string; name?: string | null } | null;
}

interface StripeSubscription {
  id: string;
  status: string;
  created: number;
  metadata?: Record<string, string> | null;
  customer?: string | { deleted?: boolean; email?: string | null } | null;
  items?: { data?: { quantity?: number | null; price?: StripePrice | null }[] };
}

interface StripePage {
  data?: StripeSubscription[];
  has_more?: boolean;
  next_page?: string | null;
  error?: { message?: string };
}

// Product names by id, for prices without a nickname. Products rarely change, so these are kept for the life of the server.
const productNames = new Map<string, string | null>();

let cached: { at: number; value: CommissionsResponse } | null = null;

const cents = (n: number) => Math.round(n * 100) / 100;

async function stripeGet(secretKey: string, path: string, params: URLSearchParams): Promise<StripePage> {
  const res = await fetch(`https://api.stripe.com/v1/${path}?${params.toString()}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}` },
    cache: "no-store",
  });
  const json = (await res.json()) as StripePage;
  if (!res.ok || json.error) throw new Error(`Stripe ${path} failed: ${json.error?.message ?? res.status}`);
  return json;
}

function expandParams(params: URLSearchParams) {
  params.append("expand[]", "data.customer");
}

async function searchSubscriptions(secretKey: string): Promise<StripeSubscription[]> {
  const all: StripeSubscription[] = [];
  let page: string | null = null;
  for (let i = 0; i < MAX_PAGES; i++) {
    const params = new URLSearchParams({ query: SEARCH_QUERY, limit: "100" });
    expandParams(params);
    if (page) params.set("page", page);
    const json = await stripeGet(secretKey, "subscriptions/search", params);
    all.push(...(json.data ?? []));
    if (!json.has_more || !json.next_page) break;
    page = json.next_page;
  }
  return all;
}

async function listSubscriptions(secretKey: string): Promise<StripeSubscription[]> {
  const all: StripeSubscription[] = [];
  let startingAfter: string | null = null;
  for (let i = 0; i < MAX_PAGES; i++) {
    const params = new URLSearchParams({ status: "all", limit: "100" });
    expandParams(params);
    if (startingAfter) params.set("starting_after", startingAfter);
    const json = await stripeGet(secretKey, "subscriptions", params);
    const data = json.data ?? [];
    all.push(...data);
    if (!json.has_more || data.length === 0) break;
    startingAfter = data[data.length - 1].id;
  }
  return all.filter((s) => Boolean(s.metadata?.rep));
}

function productIdOf(price: StripePrice | null | undefined): string | null {
  const product = price?.product;
  if (!product) return null;
  return typeof product === "string" ? product : (product.id ?? null);
}

async function loadProductNames(secretKey: string, subs: StripeSubscription[]) {
  const missing = new Set<string>();
  for (const sub of subs) {
    const price = sub.items?.data?.[0]?.price;
    const id = productIdOf(price);
    if (id && !price?.nickname && !productNames.has(id)) missing.add(id);
  }
  for (const id of missing) {
    try {
      const res = await fetch(`https://api.stripe.com/v1/products/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}` },
        cache: "no-store",
      });
      const json = (await res.json()) as { name?: string | null };
      productNames.set(id, res.ok ? (json.name ?? null) : null);
    } catch {
      // Leave it out of the map so the next refresh tries again; the row falls back to the plan in metadata.
    }
  }
}

function toRow(sub: StripeSubscription): CommissionRow | null {
  const rep = (sub.metadata?.rep ?? "").trim().toLowerCase();
  const items = sub.items?.data ?? [];
  if (!rep || items.length === 0) return null;
  // Yearly deals only.
  if (!items.some((item) => item.price?.recurring?.interval === "year")) return null;

  let amount = 0;
  for (const item of items) {
    const price = item.price;
    if (!price) continue;
    const unit = price.unit_amount ?? (price.unit_amount_decimal ? Number(price.unit_amount_decimal) : 0);
    amount += ((Number.isFinite(unit) ? unit : 0) / 100) * (item.quantity ?? 1);
  }
  amount = cents(amount);

  const first = items[0].price;
  const productId = productIdOf(first);
  const product = productId ? (productNames.get(productId) ?? null) : null;
  const customerEmail =
    sub.customer && typeof sub.customer === "object" && !sub.customer.deleted ? (sub.customer.email ?? null) : null;

  return {
    subscriptionId: sub.id,
    rep,
    customerEmail,
    plan: first?.nickname || product || sub.metadata?.plan || "Yearly plan",
    amount,
    createdAt: new Date(sub.created * 1000).toISOString(),
    status: sub.status,
    commission: cents(amount * COMMISSION_RATE),
    paidOut: false,
  };
}

export async function getCommissions(fresh = false): Promise<CommissionsResponse> {
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return { rows: [], error: "STRIPE_SECRET_KEY is not set" };

  try {
    let subs: StripeSubscription[];
    try {
      subs = await searchSubscriptions(secretKey);
    } catch (err) {
      console.warn("[commissions] search failed, listing instead:", err instanceof Error ? err.message : err);
      subs = await listSubscriptions(secretKey);
    }
    await loadProductNames(secretKey, subs);
    const rows = subs.map(toRow).filter((r): r is CommissionRow => r !== null);
    rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const value = { rows };
    cached = { at: Date.now(), value };
    return value;
  } catch (err) {
    // Not cached, so the next call tries again.
    return { rows: [], error: err instanceof Error ? err.message : "Failed to reach Stripe" };
  }
}
