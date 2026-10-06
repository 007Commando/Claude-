/**
 * Lead Desk's data model and pure derivation rules.
 *
 * Nothing here does I/O — it turns already-fetched GHL contacts and Apex
 * account records into `Lead` rows. See src/lib/leads/build.ts for the
 * fetching/merging orchestration that calls these functions.
 */

export type LeadSource =
  | "primewell"
  | "facebook-form"
  | "facebook-web"
  | "google"
  | "chatgpt"
  | "reddit"
  | "ash"
  | "direct"
  | "other";

export type SellerType = "selling" | "beginner" | "unknown";

export type Stage = "lead" | "registered" | "trial" | "customer" | "churned";

/**
 * Activation milestones — how far a lead has actually gotten into the
 * product, independent of `stage` (which tracks the sales/billing funnel).
 * The two tag-based booleans are filled from the contact's GHL tags in
 * build.ts; the rest comes from the backend marketing API (ApexMember.activation
 * in src/lib/dashboard/apex.ts) and defaults to nulls/0 until that ships.
 */
export interface LeadActivation {
  /** GHL tag `catalog-sent` — Aliza's "send vendor catalog" workflow fired. */
  vendorEmailSent: boolean;
  /** GHL tag `vendor-catalog-request`. */
  vendorEmailRequested: boolean;
  firstScanAt: string | null;
  scans: number;
  databaseProducts: number;
  databaseUpdatedAt: string | null;
  amazonConnectedAt: string | null;
}

export interface Lead {
  /** GHL contact id, or `acct:<apexAccountId>` when the lead exists only as an Apex account. */
  id: string;
  ghlContactId: string | null;
  ghlLocation: "apex" | "primewell" | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  sourceDetail: string | null;
  sellerType: SellerType;
  obstacle: string | null;
  demoTiming: string | null;
  leadAt: string;
  registeredAt: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  customerSince: string | null;
  churnedAt: string | null;
  churnReason: string | null;
  planName: string | null;
  mrr: number;
  stage: Stage;
  tags: string[];
  lastOutreachAt: string | null;
  outreachCount: number;
  ghlUrl: string | null;
  activation: LeadActivation;
  /** utm_campaign from the lead form, else the account's acquisition. Lowercased. */
  campaign: string | null;
  /** utm_content: the Meta ad name, angle_format_hook_v#. Lowercased. */
  ad: string | null;
  /** utm_term: the Meta ad set name, the audience. Lowercased. */
  adset: string | null;
  /** The angle part of the ad name (before the first underscore), when it follows the convention. */
  angle: string | null;
  /** What this person has actually paid, from Stripe's charge history. Null when they never paid. */
  ltv: LeadValue | null;
  /** Aliza's call grade, from a `grade:a|b|c` GHL tag. */
  grade: LeadGrade | null;
  /** 0 to 100: how qualified this lead looks, see qualifiedScore. */
  score: number;
}

export type LeadGrade = "A" | "B" | "C";

export interface LeadValue {
  totalPaid: number;
  paid30: number;
  paid90: number;
  monthsPaid: number;
  firstPaidAt: string | null;
}

/** A score at or above this counts the lead as qualified in the Experiments tab. */
export const QUALIFIED_SCORE = 50;

const GRADE_TAG_RE = /^grade:([abc])$/;

/** Aliza's grade from the contact's tags. If several are present, the best one wins. */
export function gradeFromTags(tags: string[]): LeadGrade | null {
  const found = tags.map((t) => t.match(GRADE_TAG_RE)?.[1]).filter(Boolean) as string[];
  if (found.length === 0) return null;
  return found.sort()[0].toUpperCase() as LeadGrade;
}

/**
 * The angle from an ad named by the convention angle_format_hook_v#
 * ("profit_video_spreadsheet_v2" is angle "profit"). Names that don't follow
 * it (no underscore) have no angle rather than a guessed one.
 */
export function parseAngle(adName: string | null): string | null {
  if (!adName) return null;
  const i = adName.indexOf("_");
  return i > 0 ? adName.slice(0, i) : null;
}

/**
 * How qualified a lead looks, 0 to 100. What they told the qualifier (already
 * selling on Amazon is the big one), how far they got into the app, and then
 * Aliza's grade from talking to them, which overrides the guess:
 * A is at least 85, B at least 55, C at most 25.
 */
export function qualifiedScore(lead: Pick<Lead, "sellerType" | "demoTiming" | "stage" | "activation" | "grade">): number {
  let score = 0;
  // An existing seller who starts a trial (30 + 10 + 15) clears the bar on its own.
  if (lead.sellerType === "selling") score += 30;
  else if (lead.sellerType === "beginner") score += 5;
  if (lead.demoTiming) score += 5;
  if (STAGE_RANK[lead.stage] >= STAGE_RANK.registered) score += 10;
  if (STAGE_RANK[lead.stage] >= STAGE_RANK.trial) score += 15;
  if (lead.activation.firstScanAt) score += 10;
  if (lead.activation.databaseProducts > 0) score += 10;
  if (lead.activation.amazonConnectedAt) score += 20;
  score = Math.min(score, 100);
  if (lead.grade === "A") return Math.max(score, 85);
  if (lead.grade === "B") return Math.max(score, 55);
  if (lead.grade === "C") return Math.min(score, 25);
  return score;
}

export const STAGE_RANK: Record<Stage, number> = {
  lead: 0,
  registered: 1,
  trial: 2,
  customer: 3,
  churned: 4,
};

export function furthestStage(a: Stage, b: Stage): Stage {
  return STAGE_RANK[a] >= STAGE_RANK[b] ? a : b;
}

/**
 * GHL and Apex both hand back dates in whatever format their underlying
 * driver serialises with — observed as RFC 1123 strings ("Tue, 24 Feb 2026
 * 18:12:39 GMT") rather than ISO 8601. `Date` parses either, but string
 * comparison (client-side filters/sorts, and the earliest-date merge below)
 * only works when every date is normalised to ISO 8601 first.
 */
export function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// Tags added to a contact once it's been copied into (or applied through)
// PrimeWell's own funnel, wherever the contact record itself lives.
const PRIMEWELL_TAGS = ["primewell-lead", "primewell-applicant", "primewell-quick-apply", "primewell-applied"];

/**
 * Source signal from GHL tags alone, checked before falling back to the Apex
 * account's recorded acquisition. Returns null when no tag says anything.
 */
export function sourceFromTags(tags: string[]): { source: LeadSource; sourceDetail: string | null } | null {
  const has = (t: string) => tags.includes(t);
  if (PRIMEWELL_TAGS.some(has)) return { source: "primewell", sourceDetail: null };
  if (has("va-offer-lead")) return { source: "facebook-form", sourceDetail: "Free VA 14 days campaign" };
  if (has("pop-facebook-lead")) return { source: "facebook-form", sourceDetail: "Facebook lead form" };
  if (has("pop-web-lead") || has("pop-web-started")) {
    return { source: "facebook-web", sourceDetail: "Facebook ad, web quiz" };
  }
  // Only reached when neither of the two tags above matched — "alone" per spec.
  if (has("pop-demo-lead")) return { source: "facebook-form", sourceDetail: "Facebook lead form" };
  // Amazon Success Hub webinar imports — checked last, since it's the least
  // specific signal (no Apex/PrimeWell/Facebook source tag matched above).
  if (has("ash") || has("reg-webinar")) {
    return { source: "ash", sourceDetail: "Amazon Success Hub webinar" };
  }
  return null;
}

/**
 * Fallback source from the Apex account's own acquisition record, used only
 * when GHL tags gave no answer. "facebook" here means an Apex signup whose
 * acquisition.source is the generic "facebook" value (no funnel tag to say
 * lead-form vs web-quiz) — mapped to facebook-web as the closer guess, since
 * generic Facebook acquisition on Apex's own signup form is a web session,
 * not a lead-gen form fill.
 */
export function sourceFromAcquisition(
  source: string | null | undefined,
  campaign: string | null | undefined,
): { source: LeadSource; sourceDetail: string | null } {
  const s = (source ?? "").trim().toLowerCase();
  let mapped: LeadSource;
  switch (s) {
    case "primewell":
      mapped = "primewell";
      break;
    case "facebook":
      mapped = "facebook-web";
      break;
    case "google":
      mapped = "google";
      break;
    case "chatgpt":
      mapped = "chatgpt";
      break;
    case "reddit":
      mapped = "reddit";
      break;
    case "":
    case "direct":
      mapped = "direct";
      break;
    default:
      mapped = "other";
  }
  return { source: mapped, sourceDetail: campaign ?? null };
}

export function deriveSellerType(fields: Record<string, string>, tags: string[], isPrimewellSource: boolean): SellerType {
  const raw = (fields["sells_on_amazon"] ?? "").trim().toLowerCase();
  if (raw === "yes") return "selling";
  if (raw === "no") return "beginner";
  // Amazon Success Hub webinar registrants self-tag their experience level
  // instead of filling in the sells_on_amazon custom field.
  if (tags.includes("already-selling")) return "selling";
  if (tags.includes("just-getting-started")) return "beginner";
  // PrimeWell applicants applied to a wholesale distributor — they sell already.
  if (isPrimewellSource) return "selling";
  return "unknown";
}

/**
 * The four activation-related GHL tags/fields, in priority order — the
 * highest one reached is what colours a card/row border (see
 * apex-app leadDesk.css and LeadCard/LeadTable). Not every lead reaches
 * "emailed" first (an Apex-only signup with no GHL contact can jump straight
 * to "connected"), so this checks highest-first rather than walking forward.
 */
export type ActivationTier = "connected" | "database" | "scanned" | "emailed";

export function activationTier(activation: LeadActivation): ActivationTier | null {
  if (activation.amazonConnectedAt) return "connected";
  if (activation.databaseProducts > 0) return "database";
  if (activation.firstScanAt) return "scanned";
  if (activation.vendorEmailSent) return "emailed";
  return null;
}

/** What the backend marketing API knows about one member's in-app activation — see ApexMember.activation. */
export interface ApexActivation {
  amazonConnectedAt: string | null;
  firstScanAt: string | null;
  scans: number;
  databaseProducts: number;
  databaseUpdatedAt: string | null;
}

/**
 * Builds a lead's activation record from its GHL tags and (when it exists)
 * the matching Apex member's own activation data. `registeredAt` is the
 * lead's already-derived account-created date, used as the fallback below.
 *
 * The `stage:amazon-connected` tag means "connected" even when the backend
 * hasn't reported an amazonConnectedAt yet (API field ships in parallel with
 * this) — in that case the account's registeredAt stands in for the real
 * connection date, since GHL doesn't carry one.
 */
export function deriveActivation(
  tags: string[],
  apexActivation: ApexActivation | null | undefined,
  registeredAt: string | null,
): LeadActivation {
  const vendorEmailSent = tags.includes("catalog-sent");
  const vendorEmailRequested = tags.includes("vendor-catalog-request");
  const amazonConnectedFallback = tags.includes("stage:amazon-connected") ? registeredAt : null;
  return {
    vendorEmailSent,
    vendorEmailRequested,
    firstScanAt: apexActivation?.firstScanAt ?? null,
    scans: apexActivation?.scans ?? 0,
    databaseProducts: apexActivation?.databaseProducts ?? 0,
    databaseUpdatedAt: apexActivation?.databaseUpdatedAt ?? null,
    amazonConnectedAt: apexActivation?.amazonConnectedAt ?? amazonConnectedFallback,
  };
}

export function deriveObstacle(fields: Record<string, string>): string | null {
  return fields["biggest_obstacle_seller"] || fields["biggest_obstacle_new"] || null;
}

export function deriveDemoTiming(fields: Record<string, string>): string | null {
  return fields["demo_timing"] || null;
}

// stage:activated and stage:amazon-connected both mean "has an account and is
// using it" — a further-along kind of registered, not a separate stage — but
// they stay in the lead's own tags array so the UI can still show them as chips.
const STAGE_TAG_MAP: Record<string, Stage> = {
  "stage:registered": "registered",
  "stage:activated": "registered",
  "stage:amazon-connected": "registered",
  "stage:trial": "trial",
  "stage:customer": "customer",
  "stage:churned": "churned",
};

export function stageFromTags(tags: string[]): Stage {
  let stage: Stage = "lead";
  for (const tag of tags) {
    const mapped = STAGE_TAG_MAP[tag];
    if (mapped) stage = furthestStage(stage, mapped);
  }
  return stage;
}

const OUTREACH_TAG_RE = /^outreach:(\d{4}-\d{2}-\d{2})$/;

export function parseOutreach(tags: string[]): { count: number; last: string | null } {
  const dates = tags
    .map((t) => t.match(OUTREACH_TAG_RE)?.[1])
    .filter((d): d is string => Boolean(d))
    .sort();
  if (dates.length === 0) return { count: 0, last: null };
  return { count: dates.length, last: dates[dates.length - 1] };
}

export function outreachToday(tags: string[], todayNy: string): boolean {
  return tags.includes(`outreach:${todayNy}`);
}

export function buildGhlUrl(location: "apex" | "primewell" | null, contactId: string | null): string | null {
  if (!location || !contactId) return null;
  const locationId = location === "apex" ? process.env.GHL_LOCATION_ID : process.env.GHL_PRIMEWELL_LOCATION_ID;
  if (!locationId) return null;
  return `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`;
}

/** What the Apex/Stripe side knows about one email, already resolved to plain values. */
export interface ApexJoin {
  createdAt: string | null;
  subscriptionStatus: string | null;
  trialEnd: string | null;
  since: string | null;
  currentPeriodEnd: string | null;
  planName: string | null;
  /** True when a canceled subscription is known (via Stripe's own cancelled-trials
   * logic) to have been canceled during/near its trial — i.e. never actually paid,
   * so it should NOT count as churn, just as "didn't convert". */
  wasTrialOnlyCancel: boolean;
  mrr: number;
  /** Stripe's cancellation reason for this email, when known — see build.ts. */
  churnReason: string | null;
}

export interface ApexDerived {
  stage: Stage;
  registeredAt: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  customerSince: string | null;
  churnedAt: string | null;
  churnReason: string | null;
  planName: string | null;
  mrr: number;
}

const EMPTY_APEX_DERIVED: ApexDerived = {
  stage: "lead",
  registeredAt: null,
  trialStartedAt: null,
  trialEndsAt: null,
  customerSince: null,
  churnedAt: null,
  churnReason: null,
  planName: null,
  mrr: 0,
};

/**
 * Apex/Stripe is the source of truth for stage and its dates whenever an
 * account exists — see the module doc in build.ts for how canceled-vs-churned
 * is told apart.
 */
export function stageFromApex(apex: ApexJoin | null): ApexDerived {
  if (!apex) return EMPTY_APEX_DERIVED;
  const status = apex.subscriptionStatus;
  // Stripe keeps trial_end on a subscription after the trial converts, so a
  // paid subscription with a trial started at `since` (subscription created)
  // and first paid at trial_end. Without a trial, `since` is the first charge.
  const hadTrial = Boolean(apex.trialEnd && apex.since && apex.trialEnd > apex.since);
  const trialStartedAt = hadTrial ? apex.since : null;
  const paidFrom = hadTrial ? apex.trialEnd : apex.since;
  if (status === "trialing") {
    return {
      ...EMPTY_APEX_DERIVED,
      stage: "trial",
      registeredAt: apex.createdAt,
      trialStartedAt: apex.since ?? apex.createdAt,
      trialEndsAt: apex.trialEnd,
    };
  }
  if (status === "active" || status === "past_due") {
    return {
      ...EMPTY_APEX_DERIVED,
      stage: "customer",
      registeredAt: apex.createdAt,
      trialStartedAt,
      trialEndsAt: hadTrial ? apex.trialEnd : null,
      customerSince: paidFrom,
      planName: apex.planName,
      mrr: apex.mrr,
    };
  }
  if (status === "canceled" && !apex.wasTrialOnlyCancel) {
    return {
      ...EMPTY_APEX_DERIVED,
      stage: "churned",
      registeredAt: apex.createdAt,
      trialStartedAt,
      trialEndsAt: hadTrial ? apex.trialEnd : null,
      customerSince: paidFrom,
      churnedAt: apex.currentPeriodEnd ?? apex.since,
      churnReason: apex.churnReason,
      planName: apex.planName,
    };
  }
  return { ...EMPTY_APEX_DERIVED, stage: "registered", registeredAt: apex.createdAt };
}
