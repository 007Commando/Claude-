import { NextRequest, NextResponse } from "next/server";
import { getStripeMetrics } from "../../../../lib/dashboard/stripe";
import { getMailchimpMetrics } from "../../../../lib/dashboard/mailchimp";
import { getMetaMetrics } from "../../../../lib/dashboard/meta";
import { getPrimewellLeads } from "../../../../lib/dashboard/ghlPrimewell";
import { getFacebookLeads } from "../../../../lib/dashboard/ghlFacebook";
import { getApexAccounts, getApexMembers, type ApexMember } from "../../../../lib/dashboard/apex";
import type {
  ApexSignupRow,
  DashboardSummary,
  GhlFunnel,
  GhlLeadRow,
  LeadSource,
  SignupsSummary,
} from "../../../../lib/dashboard/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The whole dashboard in one payload.
 *
 * Two funnels feed Apex and both are measured the same way: the leads a GHL
 * location holds, and which of those leads Apex knows as accounts, trials or
 * customers. Apex itself answers the second half, for every lead rather than
 * the newest two hundred, in one call per five hundred emails.
 *
 * Cached for five minutes per instance. Every source here is a network call
 * to somebody else's API, and a dashboard that re-asks all of them on every
 * tab switch is slow for no reason; Refresh passes ?fresh=1 to bypass.
 */
const CACHE_MS = 5 * 60 * 1000;
let cached: { at: number; summary: DashboardSummary } | null = null;

interface RawGhlLeads {
  connected: boolean;
  error?: string;
  totalLeads: number;
  newLeads7d: number;
  newLeads30d: number;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    dateAdded: string;
    optedOut: boolean;
    sourceLabel: string;
  }>;
}

const lower = (email: string) => email.trim().toLowerCase();

const isPaying = (member: ApexMember | undefined) =>
  Boolean(member?.hasAccess) && member?.subscription?.status !== "trialing";

/**
 * The other funnel this email was in first, if any. A PrimeWell applicant
 * who later lands in the Apex location came from PrimeWell, whatever the
 * second form's UTMs say.
 */
function findPriorFunnel(
  email: string,
  ownDateAdded: string,
  ownSource: LeadSource,
  firstSeen: Map<string, { source: LeadSource; dateAdded: string }[]>,
): LeadSource | null {
  const others = (firstSeen.get(lower(email)) ?? []).filter((a) => a.source !== ownSource);
  if (!others.length) return null;
  const earliest = others.reduce((a, b) => (a.dateAdded <= b.dateAdded ? a : b));
  return earliest.dateAdded < ownDateAdded ? earliest.source : null;
}

function buildGhlFunnel(
  raw: RawGhlLeads,
  ownSource: LeadSource,
  members: Record<string, ApexMember>,
  apexConnected: boolean,
  firstSeen: Map<string, { source: LeadSource; dateAdded: string }[]>,
): GhlFunnel {
  const rows: GhlLeadRow[] = raw.contacts.map((c) => {
    const member = members[lower(c.email)];
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      joinedAt: c.dateAdded,
      isApexSubscriber: Boolean(member),
      isPayingCustomer: isPaying(member),
      customerSince: member?.subscription?.since ?? null,
      planName: member?.subscription?.plan ?? null,
      subscriptionStatus: member?.subscription?.status ?? null,
      // Nothing is left to check lazily: Apex answered for every row.
      ltv: 0,
      stripeChecked: apexConnected,
      temperature: null,
      temperatureChecked: false,
      optedOut: c.optedOut,
      sourceLabel: c.sourceLabel,
      priorFunnel: findPriorFunnel(c.email, c.dateAdded, ownSource, firstSeen),
    };
  });

  return {
    connected: raw.connected,
    error: raw.error,
    totalLeads: raw.totalLeads,
    newLeads7d: raw.newLeads7d,
    newLeads30d: raw.newLeads30d,
    crossConverted: rows.filter((r) => r.isApexSubscriber).length,
    crossConvertedTruncated: !apexConnected,
    rows,
  };
}

async function build(): Promise<DashboardSummary> {
  const [stripe, mailchimp, meta, primewellRaw, facebookRaw, apexAccounts] = await Promise.all([
    getStripeMetrics(),
    getMailchimpMetrics(),
    getMetaMetrics(),
    getPrimewellLeads(),
    getFacebookLeads(),
    getApexAccounts(),
  ]);

  const allLeadEmails = [...primewellRaw.emails, ...facebookRaw.emails];
  const apexMembers = await getApexMembers(allLeadEmails);
  const apexConnected = apexMembers.connected && apexAccounts.connected;

  const firstSeen = new Map<string, { source: LeadSource; dateAdded: string }[]>();
  const note = (contacts: RawGhlLeads["contacts"], source: LeadSource) => {
    for (const c of contacts) {
      const key = lower(c.email);
      firstSeen.set(key, [...(firstSeen.get(key) ?? []), { source, dateAdded: c.dateAdded }]);
    }
  };
  note(primewellRaw.contacts, "primewell");
  note(facebookRaw.contacts, "facebook");

  const primewell = buildGhlFunnel(primewellRaw, "primewell", apexMembers.members, apexConnected, firstSeen);
  const facebook = buildGhlFunnel(facebookRaw, "facebook", apexMembers.members, apexConnected, firstSeen);

  /**
   * Where a signup came from: Apex's own acquisition record when there is
   * one, else the GHL list that holds the email, else direct. The record
   * only started being written on 2026-09-20, so most older accounts fall
   * to the list match.
   */
  const inList = new Map<string, LeadSource>();
  for (const email of facebookRaw.emails) inList.set(lower(email), "facebook");
  for (const email of primewellRaw.emails) inList.set(lower(email), "primewell");
  const sourceOf = (email: string | null, recorded: string | null | undefined): string =>
    recorded ?? (email ? (inList.get(lower(email)) ?? "direct") : "direct");

  const signupRows: ApexSignupRow[] = apexAccounts.accounts.map((m) => ({
    email: m.email,
    signedUpAt: m.createdAt ?? "",
    source: sourceOf(m.email, m.acquisition.source),
    isPayingCustomer: isPaying(m),
    isTrialing: m.subscription?.status === "trialing",
    planName: m.subscription?.plan ?? null,
    status: m.subscription?.status ?? null,
  }));

  // Totals by the resolved source, since Apex's own bySource only knows the
  // recorded acquisition and files everything older under "unknown".
  const bySource: SignupsSummary["bySource"] = {};
  const now = Date.now();
  for (const row of signupRows) {
    const bucket = (bySource[row.source] ??= { accounts: 0, paying: 0, trialing: 0, new7d: 0, new30d: 0 });
    bucket.accounts += 1;
    if (row.isPayingCustomer) bucket.paying += 1;
    if (row.isTrialing) bucket.trialing += 1;
    const age = row.signedUpAt ? now - new Date(row.signedUpAt).getTime() : Infinity;
    if (age <= 7 * 86_400_000) bucket.new7d += 1;
    if (age <= 30 * 86_400_000) bucket.new30d += 1;
  }

  const signups: SignupsSummary = {
    connected: apexAccounts.connected,
    error: apexAccounts.error,
    totalAccounts: apexAccounts.total,
    totalPayingCustomers: apexAccounts.paying,
    totalTrialing: apexAccounts.trialing,
    new7d: apexAccounts.new7d,
    new30d: apexAccounts.new30d,
    bySource,
    rows: signupRows,
  };

  const sourceFor = (email: string | null): LeadSource => {
    if (!email) return "unknown";
    const recorded = apexMembers.members[lower(email)]?.acquisition.source;
    if (recorded === "primewell" || recorded === "facebook") return recorded;
    return inList.get(lower(email)) ?? "unknown";
  };
  const enrichedStripe = {
    ...stripe,
    subscriptions: stripe.subscriptions.map((s) => ({ ...s, source: sourceFor(s.customerEmail) })),
    trials: stripe.trials.map((t) => ({ ...t, source: sourceFor(t.customerEmail) })),
    cancelledTrials: stripe.cancelledTrials.map((t) => ({ ...t, source: sourceFor(t.customerEmail) })),
  };

  const costPerLead30d =
    meta.connected && facebookRaw.connected && facebookRaw.newLeads30d > 0
      ? meta.spend30d / facebookRaw.newLeads30d
      : null;
  const costPerSale30d =
    meta.connected && stripe.connected && stripe.newCustomers30d > 0 ? meta.spend30d / stripe.newCustomers30d : null;

  return {
    stripe: enrichedStripe,
    mailchimp,
    meta,
    signups,
    primewell,
    facebook,
    blended: { costPerLead30d, costPerSale30d },
    generatedAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json(cached.summary, { headers: { "x-dashboard-cache": "hit" } });
  }
  const summary = await build();
  cached = { at: Date.now(), summary };
  return NextResponse.json(summary, { headers: { "x-dashboard-cache": "miss" } });
}
