import { getPrimewellLeads, type PrimewellContact } from "../dashboard/ghlPrimewell";
import { getFacebookLeads, type FacebookContact } from "../dashboard/ghlFacebook";
import { getApexAccounts, type ApexMember } from "../dashboard/apex";
import { getStripeMetrics } from "../dashboard/stripe";
import { getCustomerValues } from "./stripeLtv";
import { normalisePhone } from "../ghlLead";
import { getCustomFieldKeyMap, decodeCustomFields } from "./ghlFields";
import {
  type Lead,
  type LeadSource,
  type Stage,
  type ApexJoin,
  type LeadTouch,
  attributeTouches,
  channelFromGhlSource,
  furthestStage,
  sourceFromTags,
  sourceFromAcquisition,
  deriveSellerType,
  deriveObstacle,
  deriveDemoTiming,
  stageFromTags,
  stageFromApex,
  parseOutreach,
  buildGhlUrl,
  toIso,
  deriveActivation,
  gradeFromTags,
  parseAngle,
  qualifiedScore,
} from "./model";

/**
 * Merges three systems Apex already talks to into one lead list:
 *
 * 1. Apex's own GHL location (GHL_LOCATION_ID) — every contact who filled out
 *    a Pop form, got copied over as a PrimeWell applicant, etc. (fetched via
 *    getFacebookLeads, which pages the whole location despite its name).
 * 2. PrimeWell's GHL location (GHL_PRIMEWELL_LOCATION_ID) — PrimeWell's own
 *    applicant list, which includes people never copied into Apex's location.
 * 3. Apex's own accounts table (getApexAccounts) — the source of truth for
 *    "does this email actually have an account, and is it paying".
 *
 * A lead is one row per person, keyed by lowercased email (falling back to
 * normalised phone digits when there's no email at all). See dedupe() below.
 */

const CACHE_MS = 5 * 60 * 1000;

export interface LeadsTotals {
  bySourceStage: Record<LeadSource, Record<Stage, number>>;
  conversion: {
    overall: ConversionRates;
    bySource: Record<LeadSource, ConversionRates>;
  };
  weekly: WeeklyBucket[];
}

export interface ConversionRates {
  leads: number;
  registered: number;
  trials: number;
  customers: number;
  leadToRegisteredPct: number | null;
  registeredToTrialPct: number | null;
  trialToCustomerPct: number | null;
}

export interface WeeklyBucket {
  week: string;
  leadsCreated: number;
  registered: number;
  trials: number;
  customers: number;
}

export interface LeadsPayload {
  generatedAt: string;
  leads: Lead[];
  totals: LeadsTotals;
  warnings: string[];
}

const lower = (s: string) => s.trim().toLowerCase();

const SOURCES: LeadSource[] = ["primewell", "facebook-form", "facebook-web", "google", "chatgpt", "reddit", "ash", "direct", "other"];
const STAGES: Stage[] = ["lead", "registered", "trial", "customer", "churned"];

interface NormalisedContact {
  ghlContactId: string;
  ghlLocation: "apex" | "primewell";
  name: string;
  email: string | null;
  phone: string | null;
  dateAdded: string;
  /** GHL's own source text for the contact ("PrimeWell landing page", a form name). */
  ghlSource: string | null;
  tags: string[];
  fields: Record<string, string>;
}

/**
 * Our own accounts. They are real rows (Stefano's account is a real customer
 * record) but counting them as conversions inflates every rate on the page.
 */
const INTERNAL_EMAILS = new Set(
  (process.env.LEAD_DESK_INTERNAL_EMAILS ?? "info@apexapplications.io,s.sciuto4business@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Clients Stefano signs himself, outside the funnels (2026-10-07). They pay
 * through Stripe under emails no account or GHL contact carries, so they are
 * labelled for what they are instead of being flagged as unmatched.
 */
const PRIVATE_CLIENT_EMAILS = new Set(
  (process.env.LEAD_DESK_PRIVATE_CLIENTS ?? "empowered.blessed.llc@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/** A GHL contact record as one step of the lead's history: the day it was created, and where it says it came from. */
function contactTouch(contact: NormalisedContact): LeadTouch {
  if (contact.ghlLocation === "primewell") {
    return {
      at: contact.dateAdded,
      kind: "lead",
      channel: "primewell",
      label: "Applied on PrimeWell",
      detail: contact.ghlSource,
    };
  }
  const fromTags = sourceFromTags(contact.tags);
  const channel = channelFromGhlSource(contact.ghlSource) ?? fromTags?.source ?? "other";
  return {
    at: contact.dateAdded,
    kind: "lead",
    channel,
    label: fromTags?.sourceDetail ?? (contact.ghlSource ? `Added to GHL: ${contact.ghlSource}` : "Added to Apex GHL"),
    detail: contact.ghlSource,
  };
}

function normalise(
  contacts: (FacebookContact | PrimewellContact)[],
  location: "apex" | "primewell",
  idToKey: Record<string, string>,
): NormalisedContact[] {
  return contacts.map((c) => ({
    ghlContactId: c.id,
    ghlLocation: location,
    name: c.name,
    email: c.email ? lower(c.email) : null,
    phone: normalisePhone(c.phone),
    dateAdded: toIso(c.dateAdded) ?? new Date(0).toISOString(),
    ghlSource: c.ghlSource ?? null,
    tags: c.tags,
    fields: decodeCustomFields(c.customFields, idToKey),
  }));
}

function resolveSource(
  tags: string[],
  acquisitionSource: string | null | undefined,
  acquisitionCampaign: string | null | undefined,
  utmSource?: string,
): { source: LeadSource; sourceDetail: string | null } {
  // A Reddit ad lands on the same qualifier as Facebook's web ads, which
  // tags every finisher pop-web-lead; the ad's own utm_source says Reddit.
  if ([utmSource, acquisitionSource].some((s) => (s ?? "").trim().toLowerCase() === "reddit")) {
    return { source: "reddit", sourceDetail: acquisitionCampaign ?? null };
  }
  return sourceFromTags(tags) ?? sourceFromAcquisition(acquisitionSource, acquisitionCampaign);
}

function buildApexJoin(
  member: ApexMember | undefined,
  mrrByEmail: Map<string, number>,
  trialOnlyCancelEmails: Set<string>,
  churnReasonByEmail: Map<string, string>,
): ApexJoin | null {
  if (!member) return null;
  const email = lower(member.email);
  return {
    createdAt: toIso(member.createdAt),
    subscriptionStatus: member.subscription?.status ?? null,
    trialEnd: toIso(member.subscription?.trialEnd),
    since: toIso(member.subscription?.since),
    currentPeriodEnd: toIso(member.subscription?.currentPeriodEnd),
    planName: member.subscription?.plan ?? null,
    wasTrialOnlyCancel: trialOnlyCancelEmails.has(email),
    mrr: mrrByEmail.get(email) ?? 0,
    churnReason: churnReasonByEmail.get(email) ?? null,
  };
}

type LeadPrimary = { kind: "ghl"; contact: NormalisedContact } | { kind: "apexOnly"; member: ApexMember };

/** Builds one Lead from a primary contact record (GHL or Apex-only), joining in whatever the other sources know about the same email. */
function buildLead(params: {
  primary: LeadPrimary;
  /** Every GHL record for this person (the primary contact and any twin in the other location). */
  contacts: NormalisedContact[];
  extraTags: string[];
  extraFields: Record<string, string>;
  extraLeadAt: string[];
  apexMember: ApexMember | undefined;
  mrrByEmail: Map<string, number>;
  trialOnlyCancelEmails: Set<string>;
  churnReasonByEmail: Map<string, string>;
}): Lead {
  const { primary, contacts, extraTags, extraFields, extraLeadAt, apexMember, mrrByEmail, trialOnlyCancelEmails, churnReasonByEmail } =
    params;

  const isGhl = primary.kind === "ghl";
  const contact = primary.kind === "ghl" ? primary.contact : null;
  const apexOnly = primary.kind === "apexOnly" ? primary.member : null;

  const tags = contact ? [...new Set([...contact.tags, ...extraTags])] : [];
  const fields = contact ? { ...extraFields, ...contact.fields } : extraFields;

  const email = contact ? contact.email : lower(apexOnly!.email);
  const name = (contact ? contact.name : apexOnly!.email) || email || "Unknown";
  const phone = contact ? contact.phone : null;

  const leadDates = contact ? [contact.dateAdded, ...extraLeadAt] : [];
  const apexCreatedAt = toIso(apexMember?.createdAt ?? apexOnly?.createdAt ?? null);
  const leadAt =
    leadDates.length > 0
      ? leadDates.reduce((earliest, d) => (d && (!earliest || d < earliest) ? d : earliest), leadDates[0])
      : (apexCreatedAt ?? new Date().toISOString());

  const acquisition = apexMember?.acquisition ?? apexOnly?.acquisition;
  const { source: tagOrAcqSource, sourceDetail } = resolveSource(tags, acquisition?.source, acquisition?.campaign, fields["utm_source"]);

  const isPrimewellSource = tagOrAcqSource === "primewell";
  const sellerType = deriveSellerType(fields, tags, isPrimewellSource);
  const obstacle = deriveObstacle(fields);
  const demoTiming = deriveDemoTiming(fields);

  const apexJoin = buildApexJoin(apexMember ?? apexOnly ?? undefined, mrrByEmail, trialOnlyCancelEmails, churnReasonByEmail);
  const apexDerived = stageFromApex(apexJoin);
  const tagStage = isGhl ? stageFromTags(tags) : "lead";
  const stage = furthestStage(tagStage, apexDerived.stage);
  const activation = deriveActivation(tags, (apexMember ?? apexOnly ?? undefined)?.activation, apexDerived.registeredAt);

  const outreach = parseOutreach(tags);

  // The ad that brought them: what the lead form wrote to GHL first, since it
  // is captured at the moment of the lead, then the account's own record.
  const utm = (field: string, fallback: string | null | undefined) =>
    (fields[field] || fallback || "").trim().toLowerCase() || null;
  const campaign = utm("utm_campaign", acquisition?.campaign);
  const ad = utm("utm_content", acquisition?.content);
  const adset = utm("utm_term", acquisition?.term);
  const grade = gradeFromTags(tags);

  const ghlContactId = contact ? contact.ghlContactId : null;
  const ghlLocation = contact ? contact.ghlLocation : null;

  const accountSource = acquisition
    ? acquisition.source?.trim().toLowerCase() === "reddit"
      ? ({ source: "reddit", sourceDetail: acquisition.campaign ?? null } as const)
      : sourceFromAcquisition(acquisition.source, acquisition.campaign)
    : null;
  const accountDetail = [acquisition?.campaign, acquisition?.content].filter(Boolean).join(" · ") || null;
  const touches = buildTouches({
    contacts,
    registeredAt: apexDerived.registeredAt,
    accountChannel: accountSource?.source ?? null,
    accountDetail,
    trialStartedAt: apexDerived.trialStartedAt,
    customerSince: apexDerived.customerSince,
    churnedAt: apexDerived.churnedAt,
    planName: apexDerived.planName,
    churnReason: apexDerived.churnReason,
  });
  const attribution = attributeTouches(touches, apexDerived.registeredAt, tagOrAcqSource);

  return {
    id: contact ? contact.ghlContactId : `acct:${apexOnly!.accountId ?? email}`,
    ghlContactId,
    ghlLocation,
    name,
    email,
    phone,
    source: tagOrAcqSource,
    sourceDetail,
    sellerType,
    obstacle,
    demoTiming,
    leadAt,
    registeredAt: apexDerived.registeredAt,
    trialStartedAt: apexDerived.trialStartedAt,
    trialEndsAt: apexDerived.trialEndsAt,
    customerSince: apexDerived.customerSince,
    churnedAt: apexDerived.churnedAt,
    churnReason: apexDerived.churnReason,
    planName: apexDerived.planName,
    mrr: apexDerived.mrr,
    stage,
    tags,
    lastOutreachAt: outreach.last,
    outreachCount: outreach.count,
    ghlUrl: buildGhlUrl(ghlLocation, ghlContactId),
    activation,
    campaign,
    ad,
    adset,
    angle: parseAngle(ad),
    ltv: null,
    grade,
    score: qualifiedScore({ sellerType, demoTiming, stage, activation, grade }),
    touches,
    firstSource: attribution.firstSource,
    convertedVia: attribution.convertedVia,
    convertedViaDetail: attribution.convertedViaDetail,
    internal: email ? INTERNAL_EMAILS.has(email) : false,
    stripeOnly: false,
  };
}

/** The dated steps of one person's history, oldest first. */
function buildTouches(p: {
  contacts: NormalisedContact[];
  registeredAt: string | null;
  accountChannel: LeadSource | null;
  accountDetail: string | null;
  trialStartedAt: string | null;
  customerSince: string | null;
  churnedAt: string | null;
  planName: string | null;
  churnReason: string | null;
}): LeadTouch[] {
  const touches: LeadTouch[] = p.contacts.map(contactTouch);
  if (p.registeredAt) {
    touches.push({ at: p.registeredAt, kind: "account", channel: p.accountChannel, label: "Created Apex account", detail: p.accountDetail });
  }
  if (p.trialStartedAt) touches.push({ at: p.trialStartedAt, kind: "trial", channel: null, label: "Started trial", detail: p.planName });
  if (p.customerSince) touches.push({ at: p.customerSince, kind: "customer", channel: null, label: "Became a paying customer", detail: p.planName });
  if (p.churnedAt) touches.push({ at: p.churnedAt, kind: "churned", channel: null, label: "Cancelled", detail: p.churnReason });
  return touches.sort((a, b) => ((a.at ?? "") < (b.at ?? "") ? -1 : (a.at ?? "") > (b.at ?? "") ? 1 : 0));
}

async function build(): Promise<LeadsPayload> {
  const warnings: string[] = [];

  const [primewellRaw, apexLocationRaw, apexAccounts, stripe, values] = await Promise.all([
    getPrimewellLeads(),
    getFacebookLeads(),
    getApexAccounts(),
    getStripeMetrics(),
    getCustomerValues(),
  ]);
  if (values.error) warnings.push(`Stripe payments: ${values.error} (lifetime value missing)`);

  if (!primewellRaw.connected) warnings.push(`PrimeWell GHL: ${primewellRaw.error ?? "not connected"}`);
  if (!apexLocationRaw.connected) warnings.push(`Apex GHL: ${apexLocationRaw.error ?? "not connected"}`);
  if (!apexAccounts.connected) warnings.push(`Apex accounts: ${apexAccounts.error ?? "not connected"}`);
  if (!stripe.connected) warnings.push(`Stripe: ${stripe.error ?? "not connected"} (MRR figures may be incomplete)`);

  const apexToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const apexLocationId = process.env.GHL_LOCATION_ID;
  const primewellToken = process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN;
  const primewellLocationId = process.env.GHL_PRIMEWELL_LOCATION_ID;

  const [apexFieldMap, primewellFieldMap] = await Promise.all([
    apexToken && apexLocationId ? getCustomFieldKeyMap(apexToken, apexLocationId) : Promise.resolve({}),
    primewellToken && primewellLocationId ? getCustomFieldKeyMap(primewellToken, primewellLocationId) : Promise.resolve({}),
  ]);

  const apexContacts = normalise(apexLocationRaw.contacts, "apex", apexFieldMap);
  const primewellContacts = normalise(primewellRaw.contacts, "primewell", primewellFieldMap);

  // Stripe's own logic already tells apart "canceled during/near trial" (never
  // converted) from a real churn — reused here instead of re-deriving it.
  const trialOnlyCancelEmails = new Set(
    stripe.cancelledTrials.map((t) => (t.customerEmail ? lower(t.customerEmail) : null)).filter((e): e is string => Boolean(e)),
  );
  // getStripeMetrics().subscriptions is already the "status: active" list —
  // exactly the customers whose MRR a Lead row should show.
  const mrrByEmail = new Map<string, number>();
  for (const sub of stripe.subscriptions) {
    if (sub.customerEmail) mrrByEmail.set(lower(sub.customerEmail), sub.mrrContribution);
  }
  // Stripe's cancelledTrials rows are the only place a cancellation reason is
  // captured today — reused here by email even for a lead whose churn wasn't
  // itself a trial-only cancel, since it's the sole source of this field.
  const churnReasonByEmail = new Map<string, string>();
  for (const t of stripe.cancelledTrials) {
    if (t.customerEmail && t.cancellationReason) churnReasonByEmail.set(lower(t.customerEmail), t.cancellationReason);
  }

  const apexByEmail = new Map<string, ApexMember>();
  for (const m of apexAccounts.accounts) apexByEmail.set(lower(m.email), m);

  const consumedEmails = new Set<string>();
  const leads: Lead[] = [];

  // 1. Every contact in Apex's own GHL location, merged with any PrimeWell
  //    twin sharing the same email (tags/fields/leadAt union across both).
  const primewellByEmail = new Map<string, NormalisedContact>();
  for (const c of primewellContacts) if (c.email) primewellByEmail.set(c.email, c);
  const primewellByPhone = new Map<string, NormalisedContact>();
  for (const c of primewellContacts) if (c.phone) primewellByPhone.set(c.phone, c);

  const consumedPrimewellIds = new Set<string>();

  for (const contact of apexContacts) {
    const twin =
      (contact.email && primewellByEmail.get(contact.email)) ||
      (contact.phone && primewellByPhone.get(contact.phone)) ||
      undefined;
    if (twin) consumedPrimewellIds.add(twin.ghlContactId);

    const apexMember = contact.email ? apexByEmail.get(contact.email) : undefined;
    const lead = buildLead({
      primary: { kind: "ghl", contact },
      contacts: twin ? [contact, twin] : [contact],
      extraTags: twin?.tags ?? [],
      extraFields: twin?.fields ?? {},
      extraLeadAt: twin ? [twin.dateAdded] : [],
      apexMember,
      mrrByEmail,
      trialOnlyCancelEmails,
      churnReasonByEmail,
    });
    leads.push(lead);
    if (contact.email) consumedEmails.add(contact.email);
  }

  // 2. PrimeWell-location contacts with no Apex-location twin (by email, then
  //    phone) are standalone PrimeWell leads in their own right.
  for (const contact of primewellContacts) {
    if (consumedPrimewellIds.has(contact.ghlContactId)) continue;
    const apexMember = contact.email ? apexByEmail.get(contact.email) : undefined;
    const lead = buildLead({
      primary: { kind: "ghl", contact },
      contacts: [contact],
      extraTags: [],
      extraFields: {},
      extraLeadAt: [],
      apexMember,
      mrrByEmail,
      trialOnlyCancelEmails,
      churnReasonByEmail,
    });
    // Standalone PrimeWell-location leads are PrimeWell leads by definition,
    // per spec, regardless of what (if any) tags/acquisition otherwise resolved to.
    lead.source = "primewell";
    if (!lead.sourceDetail) lead.sourceDetail = "PrimeWell application";
    if (lead.sellerType === "unknown") lead.sellerType = "selling";
    leads.push(lead);
    if (contact.email) consumedEmails.add(contact.email);
  }

  // 3. Apex accounts with no GHL contact trace anywhere — signed up directly.
  for (const member of apexAccounts.accounts) {
    const email = lower(member.email);
    if (consumedEmails.has(email)) continue;
    const lead = buildLead({
      primary: { kind: "apexOnly", member },
      contacts: [],
      extraTags: [],
      extraFields: {},
      extraLeadAt: [],
      apexMember: member,
      mrrByEmail,
      trialOnlyCancelEmails,
      churnReasonByEmail,
    });
    leads.push(lead);
    consumedEmails.add(email);
  }

  reconcileWithStripe(leads, stripe, apexAccounts.accounts);

  leads.sort((a, b) => (a.leadAt < b.leadAt ? 1 : -1));

  for (const lead of leads) {
    const value = lead.email ? values.byEmail.get(lead.email) : undefined;
    if (value && value.totalPaid > 0) {
      lead.ltv = {
        totalPaid: value.totalPaid,
        paid30: value.paid30,
        paid90: value.paid90,
        monthsPaid: value.monthsPaid,
        firstPaidAt: value.firstPaidAt,
      };
    }
  }

  // Amazon Success Hub webinar imports are real contacts but not sales leads
  // until they do something: an imported name that never signed up is left
  // out of every aggregate, but one who made an account, trialed or paid is a
  // conversion like any other and counts. Our own accounts never count.
  const totals = computeTotals(leads.filter(countsTowardTotals));

  return { generatedAt: new Date().toISOString(), leads, totals, warnings };
}

/** Whether a lead belongs in the page's totals: not ours, and not a webinar import that never signed up. */
export function countsTowardTotals(lead: Lead): boolean {
  if (lead.internal) return false;
  return !(lead.source === "ash" && lead.stage === "lead");
}

/**
 * Stripe has the final word on who is paying and who is trialing.
 *
 * The stage above comes from the Apex account's own subscription record,
 * which misses subscriptions bought under a different email or not linked to
 * the account (2026-10-07: five paying customers read as "account, no trial"
 * or were missing, and two trials were hidden). Each live Stripe subscription
 * is matched to a lead by email, then by the account id our checkout writes
 * into the subscription; a match is moved up to the stage Stripe says, and no
 * match becomes its own row, flagged Stripe only, so nothing paid is ever
 * invisible here.
 */
function reconcileWithStripe(
  leads: Lead[],
  stripe: Awaited<ReturnType<typeof getStripeMetrics>>,
  members: ApexMember[],
): void {
  const byEmail = new Map<string, Lead>();
  for (const lead of leads) if (lead.email) byEmail.set(lead.email, lead);
  const byAccount = new Map<string, Lead>();
  for (const m of members) {
    const lead = byEmail.get(lower(m.email));
    if (lead && m.accountId) byAccount.set(m.accountId, lead);
  }
  const find = (email: string | null, accountId: string | null) =>
    (email ? byEmail.get(lower(email)) : undefined) ?? (accountId ? byAccount.get(accountId) : undefined);
  const addTouch = (lead: Lead, touch: LeadTouch) => {
    if (lead.touches.some((t) => t.kind === touch.kind)) return;
    lead.touches = [...lead.touches, touch].sort((a, b) => ((a.at ?? "") < (b.at ?? "") ? -1 : 1));
  };

  for (const sub of stripe.subscriptions) {
    const lead = find(sub.customerEmail, sub.accountId);
    if (lead) {
      if (lead.stage !== "customer") {
        lead.stage = "customer";
        lead.customerSince = lead.customerSince ?? sub.startedAt;
        lead.churnedAt = null;
      }
      lead.planName = lead.planName ?? sub.planName;
      if (sub.mrrContribution > 0) lead.mrr = sub.mrrContribution;
      addTouch(lead, { at: lead.customerSince, kind: "customer", channel: null, label: "Became a paying customer", detail: lead.planName });
    } else if (sub.customerEmail || sub.customerName) {
      const row = stripeOnlyLead(sub.customerEmail, sub.customerName, sub.startedAt);
      row.stage = "customer";
      row.customerSince = sub.startedAt;
      row.planName = sub.planName;
      row.mrr = sub.mrrContribution;
      row.touches.push({ at: sub.startedAt, kind: "customer", channel: null, label: "Became a paying customer", detail: sub.planName });
      leads.push(row);
      if (row.email) byEmail.set(row.email, row);
    }
  }

  for (const trial of stripe.trials) {
    const lead = find(trial.customerEmail, trial.accountId);
    if (lead) {
      if (lead.stage === "lead" || lead.stage === "registered" || lead.stage === "churned") {
        lead.stage = "trial";
        lead.churnedAt = null;
      }
      lead.trialStartedAt = lead.trialStartedAt ?? trial.trialStartAt;
      lead.trialEndsAt = lead.trialEndsAt ?? trial.trialEndAt;
      lead.planName = lead.planName ?? trial.planName;
      addTouch(lead, { at: lead.trialStartedAt, kind: "trial", channel: null, label: "Started trial", detail: lead.planName });
    } else if (trial.customerEmail || trial.customerName) {
      const at = trial.trialStartAt ?? new Date().toISOString();
      const row = stripeOnlyLead(trial.customerEmail, trial.customerName, at);
      row.stage = "trial";
      row.trialStartedAt = trial.trialStartAt;
      row.trialEndsAt = trial.trialEndAt;
      row.planName = trial.planName;
      row.touches.push({ at, kind: "trial", channel: null, label: "Started trial", detail: trial.planName });
      leads.push(row);
      if (row.email) byEmail.set(row.email, row);
    }
  }
}

/** A row for someone Stripe knows and nothing else does. */
function stripeOnlyLead(email: string | null, name: string | null, at: string): Lead {
  const e = email ? lower(email) : null;
  const privateClient = e ? PRIVATE_CLIENT_EMAILS.has(e) : false;
  return {
    id: `stripe:${e ?? name ?? at}`,
    ghlContactId: null,
    ghlLocation: null,
    name: name || e || "Unknown",
    email: e,
    phone: null,
    source: "direct",
    sourceDetail: privateClient ? "Private client" : "Stripe only: no account or GHL contact has this email",
    sellerType: "unknown",
    obstacle: null,
    demoTiming: null,
    leadAt: at,
    registeredAt: null,
    trialStartedAt: null,
    trialEndsAt: null,
    customerSince: null,
    churnedAt: null,
    churnReason: null,
    planName: null,
    mrr: 0,
    stage: "lead",
    tags: privateClient ? ["private-client"] : [],
    lastOutreachAt: null,
    outreachCount: 0,
    ghlUrl: null,
    activation: {
      vendorEmailSent: false,
      vendorEmailRequested: false,
      firstScanAt: null,
      scans: 0,
      databaseProducts: 0,
      databaseUpdatedAt: null,
      amazonConnectedAt: null,
    },
    campaign: null,
    ad: null,
    adset: null,
    angle: null,
    ltv: null,
    grade: null,
    score: 0,
    touches: [],
    firstSource: "direct",
    convertedVia: null,
    convertedViaDetail: null,
    internal: e ? INTERNAL_EMAILS.has(e) : false,
    stripeOnly: !privateClient,
  };
}

function emptyConversion(): ConversionRates {
  return {
    leads: 0,
    registered: 0,
    trials: 0,
    customers: 0,
    leadToRegisteredPct: null,
    registeredToTrialPct: null,
    trialToCustomerPct: null,
  };
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function rank(stage: Stage): number {
  return STAGES.indexOf(stage);
}

function conversionFor(leads: Lead[]): ConversionRates {
  const total = leads.length;
  const registeredPlus = leads.filter((l) => rank(l.stage) >= rank("registered")).length;
  const trialPlus = leads.filter((l) => rank(l.stage) >= rank("trial")).length;
  const customerPlus = leads.filter((l) => rank(l.stage) >= rank("customer")).length; // includes churned — they did convert once
  return {
    leads: total,
    registered: registeredPlus,
    trials: trialPlus,
    customers: customerPlus,
    leadToRegisteredPct: pct(registeredPlus, total),
    registeredToTrialPct: pct(trialPlus, registeredPlus),
    trialToCustomerPct: pct(customerPlus, trialPlus),
  };
}

function isoWeekKey(iso: string): string {
  const d = new Date(iso);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / 86_400_000 / 7 - (firstThursdayDay - 3) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function computeTotals(leads: Lead[]): LeadsTotals {
  const bySourceStage = {} as Record<LeadSource, Record<Stage, number>>;
  for (const source of SOURCES) {
    bySourceStage[source] = {} as Record<Stage, number>;
    for (const stage of STAGES) bySourceStage[source][stage] = 0;
  }
  for (const lead of leads) bySourceStage[lead.source][lead.stage] += 1;

  const conversionBySource = {} as Record<LeadSource, ConversionRates>;
  for (const source of SOURCES) {
    const subset = leads.filter((l) => l.source === source);
    conversionBySource[source] = subset.length > 0 ? conversionFor(subset) : emptyConversion();
  }

  // Last 8 ISO weeks, oldest first, anchored on today regardless of whether
  // every week has data — a flat trend line is real information too.
  const weekKeys: string[] = [];
  const cursor = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(cursor.getTime() - i * 7 * 86_400_000);
    weekKeys.push(isoWeekKey(d.toISOString()));
  }
  const weekIndex = new Map(weekKeys.map((w, i) => [w, i]));
  const weekly: WeeklyBucket[] = weekKeys.map((week) => ({ week, leadsCreated: 0, registered: 0, trials: 0, customers: 0 }));

  const bump = (iso: string | null, field: keyof Omit<WeeklyBucket, "week">) => {
    if (!iso) return;
    const idx = weekIndex.get(isoWeekKey(iso));
    if (idx == null) return;
    weekly[idx][field] += 1;
  };
  for (const lead of leads) {
    bump(lead.leadAt, "leadsCreated");
    bump(lead.registeredAt, "registered");
    bump(lead.trialStartedAt, "trials");
    bump(lead.customerSince, "customers");
  }

  return {
    bySourceStage,
    conversion: { overall: conversionFor(leads), bySource: conversionBySource },
    weekly,
  };
}

let cached: { at: number; payload: LeadsPayload } | null = null;

export async function getLeads(fresh: boolean): Promise<LeadsPayload> {
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.payload;
  const payload = await build();
  cached = { at: Date.now(), payload };
  return payload;
}

/** Looks a single lead up from the cache, refreshing first if the cache is empty or stale. */
export async function findLead(leadId: string): Promise<Lead | null> {
  const payload = cached && Date.now() - cached.at < CACHE_MS ? cached.payload : await getLeads(false);
  return payload.leads.find((l) => l.id === leadId) ?? null;
}
