import { getSupabaseAdmin } from "./supabaseAdmin";
import type { StripeCustomerLookup } from "./stripe";

export interface ApexSignupRow {
  email: string;
  signedUpAt: string;
  source: string;
  isPayingCustomer: boolean;
  ltv: number;
  unsubscribed: boolean;
}

export interface SignupsSummary {
  connected: boolean;
  error?: string;
  totalAccounts: number;
  totalPayingCustomers: number;
  /** True if totalPayingCustomers only reflects the MAX_ROWS most recent signups, not all-time. */
  payingCustomersTruncated: boolean;
  rows: ApexSignupRow[];
}

const empty: SignupsSummary = {
  connected: false,
  totalAccounts: 0,
  totalPayingCustomers: 0,
  payingCustomersTruncated: false,
  rows: [],
};

// Bounds how many recent signups get a live Stripe lookup per page load —
// generous for current volume, but a scheduled sync would be needed well
// beyond this if the signup list grows much larger.
const MAX_ROWS = 200;

export interface ApexSignupEntries {
  connected: boolean;
  error?: string;
  totalAccounts: number;
  /** Most recent MAX_ROWS signups, newest first — email is the join key for Stripe enrichment. */
  entries: Array<{ email: string; source: string; signedUpAt: string }>;
}

const emptyEntries: ApexSignupEntries = { connected: false, totalAccounts: 0, entries: [] };

/** Reads Apex signup events from Supabase only — no Stripe calls. Pair with
 * buildSignupsSummary() once you have a Stripe lookup map (shared across
 * callers so the same emails aren't looked up in Stripe twice). */
export async function getApexSignupEntries(): Promise<ApexSignupEntries> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { ...emptyEntries, error: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set" };
  }

  const { data, error } = await admin
    .from("leads")
    .select("email, source, created_at")
    .eq("event", "apex_signup")
    .not("email", "is", null)
    .order("created_at", { ascending: true })
    .limit(5000);

  if (error) {
    return { ...emptyEntries, error: error.message };
  }

  const rows = (data ?? []) as Array<{ email: string; source: string; created_at: string }>;

  const firstTouchByEmail = new Map<string, { source: string; signedUpAt: string }>();
  for (const row of rows) {
    if (!firstTouchByEmail.has(row.email)) {
      firstTouchByEmail.set(row.email, { source: row.source, signedUpAt: row.created_at });
    }
  }

  const entries = [...firstTouchByEmail.entries()]
    .sort((a, b) => new Date(b[1].signedUpAt).getTime() - new Date(a[1].signedUpAt).getTime())
    .slice(0, MAX_ROWS)
    .map(([email, info]) => ({ email, source: info.source, signedUpAt: info.signedUpAt }));

  return { connected: true, totalAccounts: firstTouchByEmail.size, entries };
}

export function buildSignupsSummary(
  entries: ApexSignupEntries,
  stripeStatusByEmail: Map<string, StripeCustomerLookup>,
): SignupsSummary {
  if (!entries.connected) {
    return { ...empty, error: entries.error };
  }

  const rows: ApexSignupRow[] = entries.entries.map((entry) => {
    const stripe = stripeStatusByEmail.get(entry.email);
    return {
      email: entry.email,
      signedUpAt: entry.signedUpAt,
      source: entry.source,
      isPayingCustomer: stripe?.isCustomer ?? false,
      ltv: stripe?.ltv ?? 0,
      unsubscribed: stripe ? stripe.hadSubscription && !stripe.isActiveSubscriber : false,
    };
  });

  return {
    connected: true,
    totalAccounts: entries.totalAccounts,
    totalPayingCustomers: rows.filter((r) => r.isPayingCustomer).length,
    payingCustomersTruncated: entries.totalAccounts > entries.entries.length,
    rows,
  };
}
