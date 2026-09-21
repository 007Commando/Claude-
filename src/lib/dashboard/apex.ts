/**
 * Apex's own answer to "is this lead one of ours".
 *
 * Membership, payment and where a signup came from are facts Apex holds: the
 * account exists there, its access map says whether it pays, and the
 * acquisition captured at signup says the source. Asking Stripe for each
 * email and Supabase for a signup log was guessing at the same facts from
 * the outside, slowly, and the production site never had the Supabase keys,
 * so every lead read "Unknown".
 */

const BASE_URL = process.env.APEX_API_URL ?? "https://app.apexapplications.io/api";
const KEY = process.env.APEX_INTERNAL_API_KEY;
const TIMEOUT_MS = 25_000;
/** Emails per members call; the endpoint takes 2000, this keeps one call short. */
const BATCH = 500;

export interface ApexMember {
  email: string;
  uid: string;
  accountId: string | null;
  createdAt: string | null;
  acquisition: { source: string | null; medium: string | null; campaign: string | null };
  /** The app's own gate: active, trialing or past_due. */
  hasAccess: boolean;
  subscription: {
    id: string;
    plan: string;
    period: string | null;
    status: string;
    since: string;
    trialEnd: string | null;
    currentPeriodEnd: string | null;
  } | null;
}

export interface ApexMembersResult {
  connected: boolean;
  error?: string;
  members: Record<string, ApexMember>;
}

export interface ApexSourceTotals {
  accounts: number;
  paying: number;
  trialing: number;
  new7d: number;
  new30d: number;
}

export interface ApexAccountsResult {
  connected: boolean;
  error?: string;
  accounts: ApexMember[];
  total: number;
  paying: number;
  trialing: number;
  new7d: number;
  new30d: number;
  bySource: Record<string, ApexSourceTotals>;
}

export const isApexConfigured = () => Boolean(KEY);

async function apexFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const separator = path.includes("?") ? "&" : "?";
    const res = await fetch(`${BASE_URL}${path}${separator}apiKey=${encodeURIComponent(KEY ?? "")}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Apex ${path.split("?")[0]} failed: ${res.status} ${body.slice(0, 160)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** Every member among these emails, keyed by lowercased email. */
export async function getApexMembers(emails: string[]): Promise<ApexMembersResult> {
  if (!KEY) return { connected: false, error: "APEX_INTERNAL_API_KEY is not set", members: {} };
  const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const members: Record<string, ApexMember> = {};
  try {
    for (let i = 0; i < unique.length; i += BATCH) {
      const page = await apexFetch<{ members: Record<string, ApexMember> }>("/internal/marketing/members", {
        method: "POST",
        body: JSON.stringify({ emails: unique.slice(i, i + BATCH) }),
      });
      Object.assign(members, page.members);
    }
    return { connected: true, members };
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : "Failed to reach Apex", members };
  }
}

/** Every seller account Apex has, newest first, with per-source totals. */
export async function getApexAccounts(): Promise<ApexAccountsResult> {
  const empty: ApexAccountsResult = {
    connected: false,
    accounts: [],
    total: 0,
    paying: 0,
    trialing: 0,
    new7d: 0,
    new30d: 0,
    bySource: {},
  };
  if (!KEY) return { ...empty, error: "APEX_INTERNAL_API_KEY is not set" };
  try {
    const result = await apexFetch<Omit<ApexAccountsResult, "connected" | "error">>("/internal/marketing/accounts");
    return { connected: true, ...result };
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : "Failed to reach Apex" };
  }
}
