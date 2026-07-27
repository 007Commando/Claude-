import { NextResponse } from "next/server";
import { getStripeMetrics, lookupStripeCustomersByEmail, type StripeCustomerLookup } from "../../../../lib/dashboard/stripe";
import { getMailchimpMetrics } from "../../../../lib/dashboard/mailchimp";
import { getMetaMetrics } from "../../../../lib/dashboard/meta";
import { getLeadsSummary } from "../../../../lib/dashboard/leads";
import { getApexSignupEntries, buildSignupsSummary } from "../../../../lib/dashboard/signups";
import { getPrimewellLeads } from "../../../../lib/dashboard/ghlPrimewell";
import { getFacebookLeads } from "../../../../lib/dashboard/ghlFacebook";
import { getAshLeads } from "../../../../lib/dashboard/ghlAsh";
import type { DashboardSummary, GhlFunnel, GhlLeadRow, LeadSource } from "../../../../lib/dashboard/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// The full GHL contact list (all ~1000+) is cheap to fetch, but a live
// Stripe lookup per contact is not — so only this many (most recent first)
// get checked eagerly for the aggregate "Converted" count on page load. The
// rest are enriched lazily per table page via /api/dashboard/primewell-stripe-status.
const AGGREGATE_STRIPE_CHECK_LIMIT = 200;

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
  }>;
}

// Shared shape between PrimeWell's, Facebook's, and ASH's GHL leads — all
// cross-reference against the same Apex signups/Stripe status the same way.
function buildGhlFunnel(
  raw: RawGhlLeads,
  eagerEmails: Set<string>,
  apexSignupEmails: Set<string>,
  stripeStatusByEmail: Map<string, StripeCustomerLookup>,
  payingCustomersTruncated: boolean,
): GhlFunnel {
  const rows: GhlLeadRow[] = raw.contacts.map((c) => {
    const stripeChecked = eagerEmails.has(c.email);
    const stripeStatus = stripeStatusByEmail.get(c.email);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      joinedAt: c.dateAdded,
      isApexSubscriber: apexSignupEmails.has(c.email),
      isPayingCustomer: stripeChecked ? (stripeStatus?.isCustomer ?? false) : false,
      customerSince: stripeChecked ? (stripeStatus?.customerSince ?? null) : null,
      planName: stripeChecked ? (stripeStatus?.planName ?? null) : null,
      ltv: stripeChecked ? (stripeStatus?.ltv ?? 0) : 0,
      stripeChecked,
      // Temperature is always fetched lazily per visible table page (see
      // GhlLeadsTable in page.tsx) — never eagerly, since it costs one live
      // GHL API call per contact and this route already does enough of those.
      temperature: null,
      temperatureChecked: false,
      optedOut: c.optedOut,
    };
  });

  // Converted = matched a free Apex signup (needs Supabase) OR matched a
  // paying Stripe customer directly (works even without Supabase) — using
  // just the signup-only definition undercounts real conversions, since a
  // lead can go straight to a paid Apex plan without ever showing up in our
  // free-signup tracking. Only counts the eagerly-checked slice — see
  // crossConvertedTruncated.
  const crossConverted = rows.filter((r) => r.isApexSubscriber || r.isPayingCustomer).length;

  return {
    connected: raw.connected,
    error: raw.error,
    totalLeads: raw.totalLeads,
    newLeads7d: raw.newLeads7d,
    newLeads30d: raw.newLeads30d,
    crossConverted,
    crossConvertedTruncated: raw.totalLeads > AGGREGATE_STRIPE_CHECK_LIMIT || payingCustomersTruncated,
    rows,
  };
}

export async function GET() {
  const [stripe, mailchimp, meta, leads, signupEntries, primewellRaw, facebookRaw, ashRaw] = await Promise.all([
    getStripeMetrics(),
    getMailchimpMetrics(),
    getMetaMetrics(),
    getLeadsSummary(),
    getApexSignupEntries(),
    getPrimewellLeads(),
    getFacebookLeads(),
    getAshLeads(),
  ]);

  const costPerLead30d =
    meta.connected && facebookRaw.connected && facebookRaw.newLeads30d > 0
      ? meta.spend30d / facebookRaw.newLeads30d
      : null;
  const costPerSale30d =
    meta.connected && stripe.connected && stripe.newCustomers30d > 0
      ? meta.spend30d / stripe.newCustomers30d
      : null;

  const eagerPrimewellContacts = primewellRaw.contacts.slice(0, AGGREGATE_STRIPE_CHECK_LIMIT);
  const eagerFacebookContacts = facebookRaw.contacts.slice(0, AGGREGATE_STRIPE_CHECK_LIMIT);
  const eagerAshContacts = ashRaw.contacts.slice(0, AGGREGATE_STRIPE_CHECK_LIMIT);

  // One shared Stripe lookup across the Apex signups table and the eagerly-
  // checked slice of all three GHL sources — cuts down API calls vs. each
  // looking up its own emails independently, and lets overlaps share a hit.
  const allEmails = [
    ...signupEntries.entries.map((e) => e.email),
    ...eagerPrimewellContacts.map((c) => c.email),
    ...eagerFacebookContacts.map((c) => c.email),
    ...eagerAshContacts.map((c) => c.email),
  ];
  const stripeStatusByEmail = await lookupStripeCustomersByEmail(allEmails);

  const signups = buildSignupsSummary(signupEntries, stripeStatusByEmail);
  const apexSignupEmails = new Set(signups.rows.map((r) => r.email));

  const primewell = buildGhlFunnel(
    primewellRaw,
    new Set(eagerPrimewellContacts.map((c) => c.email)),
    apexSignupEmails,
    stripeStatusByEmail,
    signups.payingCustomersTruncated,
  );
  const facebook = buildGhlFunnel(
    facebookRaw,
    new Set(eagerFacebookContacts.map((c) => c.email)),
    apexSignupEmails,
    stripeStatusByEmail,
    signups.payingCustomersTruncated,
  );
  const ash = buildGhlFunnel(
    ashRaw,
    new Set(eagerAshContacts.map((c) => c.email)),
    apexSignupEmails,
    stripeStatusByEmail,
    signups.payingCustomersTruncated,
  );

  // Tags each Stripe subscription/trial with which GHL funnel its email came
  // from, so the MRR/ARR/Trials modals can show where a customer originated.
  // Built from each source's full email list (not just the eagerly-checked
  // slice) since this is a cheap in-memory lookup, not another Stripe call.
  // On overlap between sources, PrimeWell wins arbitrarily (last write).
  const sourceByEmail = new Map<string, LeadSource>();
  for (const email of ashRaw.emails) sourceByEmail.set(email.toLowerCase(), "ash");
  for (const email of facebookRaw.emails) sourceByEmail.set(email.toLowerCase(), "facebook");
  for (const email of primewellRaw.emails) sourceByEmail.set(email.toLowerCase(), "primewell");

  const sourceFor = (email: string | null): LeadSource =>
    (email && sourceByEmail.get(email.toLowerCase())) || "unknown";

  const enrichedStripe = {
    ...stripe,
    subscriptions: stripe.subscriptions.map((s) => ({ ...s, source: sourceFor(s.customerEmail) })),
    trials: stripe.trials.map((t) => ({ ...t, source: sourceFor(t.customerEmail) })),
  };

  const summary: DashboardSummary = {
    stripe: enrichedStripe,
    mailchimp,
    meta,
    leads,
    signups,
    primewell,
    facebook,
    ash,
    blended: { costPerLead30d, costPerSale30d },
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(summary);
}
