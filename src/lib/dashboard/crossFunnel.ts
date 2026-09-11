const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

// Same bounds as the per-location summaries (see ghlPrimewell.ts) — the match
// is computed over full contact lists from both locations, so the caps are
// what keep one dashboard load from paging through an unbounded CRM.
const MAX_CONTACTS = 6000;
const PAGE_SIZE = 100;
const PAGE_TIMEOUT_MS = 6000;

interface GhlContact {
  id: string;
  email?: string;
  phone?: string;
  timezone?: string;
  dateAdded?: string;
}

interface GhlContactsPage {
  contacts: GhlContact[];
  meta: { total: number; startAfterId?: string | null; startAfter?: number | null };
}

export interface CrossFunnelCohort {
  label: string;
  pwLeads: number;
  pwUs: number;
  moved: number;
  movedUs: number;
}

export interface CrossFunnelSummary {
  connected: boolean;
  error?: string;
  cohorts: CrossFunnelCohort[];
  total: CrossFunnelCohort;
  medianDaysToMove: number | null;
  excludedAshFirst: number;
  truncated: boolean;
}

const emptyCohort = (label: string): CrossFunnelCohort => ({
  label,
  pwLeads: 0,
  pwUs: 0,
  moved: 0,
  movedUs: 0,
});

const empty: CrossFunnelSummary = {
  connected: false,
  cohorts: [],
  total: emptyCohort("total"),
  medianDaysToMove: null,
  excludedAshFirst: 0,
  truncated: false,
};

async function ghlFetchOnce<T>(path: string, token: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);
  try {
    const res = await fetch(`${GHL_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GHL ${path} failed: ${res.status} ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function ghlFetch<T>(path: string, token: string, retry: boolean): Promise<T> {
  try {
    return await ghlFetchOnce<T>(path, token);
  } catch (err) {
    if (!retry) throw err;
    return ghlFetchOnce<T>(path, token);
  }
}

async function fetchContacts(
  token: string,
  locationId: string,
): Promise<{ contacts: GhlContact[]; truncated: boolean }> {
  const contacts: GhlContact[] = [];
  let startAfterId: string | undefined;
  let startAfter: number | undefined;

  while (contacts.length < MAX_CONTACTS) {
    const cursor =
      startAfterId && startAfter ? `&startAfterId=${startAfterId}&startAfter=${startAfter}` : "";
    const page = await ghlFetch<GhlContactsPage>(
      `/contacts/?locationId=${locationId}&limit=${PAGE_SIZE}${cursor}`,
      token,
      contacts.length === 0,
    );
    contacts.push(...page.contacts);
    if (page.contacts.length < PAGE_SIZE || !page.meta?.startAfterId) {
      return { contacts, truncated: false };
    }
    startAfterId = page.meta.startAfterId;
    startAfter = page.meta.startAfter ?? undefined;
  }
  return { contacts, truncated: true };
}

const normalizeEmail = (c: GhlContact) => (c.email || "").trim().toLowerCase() || null;

const normalizePhone = (c: GhlContact) => {
  const digits = (c.phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
};

const addedAt = (c: GhlContact) => (c.dateAdded ? new Date(c.dateAdded).getTime() : null);

// Canadian zones share the +1 prefix; a +1 number in one of these is not a US
// lead, and they were 3% of movers when measured.
const CANADA_TZ = new Set([
  "America/Toronto",
  "America/Vancouver",
  "America/Edmonton",
  "America/Winnipeg",
  "America/Halifax",
  "America/St_Johns",
  "America/Regina",
  "America/Moncton",
]);

/**
 * "US" needs both signals, because the CRM's own country field is stamped
 * "US" on every contact by the location default and carries no information.
 * Measured on real movers, requiring +1 phone AND a US timezone excludes the
 * overseas-buyer-with-a-US-VOIP-number pattern (11% of movers) that a
 * phone-only rule counts as domestic.
 */
export const isUsLead = (c: GhlContact): boolean => {
  const tz = c.timezone || "";
  return (c.phone || "").trim().startsWith("+1") && tz.startsWith("America/") && !CANADA_TZ.has(tz);
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How PrimeWell leads move on to ASH, in 30-day cohorts.
 *
 * A "move" is the same person — matched by email, phone as fallback — showing
 * up in the ASH location at or after their PrimeWell entry. Contacts that
 * existed in ASH first travelled the other way and are excluded rather than
 * counted, since including them flatters the rate.
 */
export async function getCrossFunnelSummary(): Promise<CrossFunnelSummary> {
  const pwToken = process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN;
  const pwLocation = process.env.GHL_PRIMEWELL_LOCATION_ID;
  const ashToken = process.env.GHL_ASH_PRIVATE_INTEGRATION_TOKEN;
  const ashLocation = process.env.GHL_ASH_LOCATION_ID;

  if (!pwToken || !pwLocation || !ashToken || !ashLocation) {
    return { ...empty, error: "PrimeWell or ASH GHL credentials are not set" };
  }

  let pw: { contacts: GhlContact[]; truncated: boolean };
  let ash: { contacts: GhlContact[]; truncated: boolean };
  try {
    [pw, ash] = await Promise.all([
      fetchContacts(pwToken, pwLocation),
      fetchContacts(ashToken, ashLocation),
    ]);
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : "Failed to reach GHL" };
  }

  // Earliest ASH entry per identity, so "did they arrive after PrimeWell" is
  // judged against their first appearance, not a later duplicate.
  const ashByEmail = new Map<string, GhlContact>();
  const ashByPhone = new Map<string, GhlContact>();
  for (const contact of ash.contacts) {
    const email = normalizeEmail(contact);
    const phone = normalizePhone(contact);
    const at = addedAt(contact);
    if (email) {
      const held = ashByEmail.get(email);
      if (!held || (at && (addedAt(held) ?? Infinity) > at)) ashByEmail.set(email, contact);
    }
    if (phone) {
      const held = ashByPhone.get(phone);
      if (!held || (at && (addedAt(held) ?? Infinity) > at)) ashByPhone.set(phone, contact);
    }
  }

  const now = Date.now();
  const cohortDefs = [
    { label: "0-30d", from: now - 30 * DAY_MS, to: now },
    { label: "30-60d", from: now - 60 * DAY_MS, to: now - 30 * DAY_MS },
    { label: "60-90d", from: now - 90 * DAY_MS, to: now - 60 * DAY_MS },
  ];
  const cohorts = cohortDefs.map((def) => emptyCohort(def.label));
  const total = emptyCohort("total");
  const gaps: number[] = [];
  let excludedAshFirst = 0;

  for (const contact of pw.contacts) {
    const at = addedAt(contact);
    if (!at) continue;
    const cohortIndex = cohortDefs.findIndex((def) => at >= def.from && at < def.to);
    if (cohortIndex === -1) continue;

    const cohort = cohorts[cohortIndex];
    const us = isUsLead(contact);
    cohort.pwLeads += 1;
    if (us) cohort.pwUs += 1;

    const email = normalizeEmail(contact);
    const phone = normalizePhone(contact);
    const match = (email && ashByEmail.get(email)) || (phone && ashByPhone.get(phone)) || null;
    if (!match) continue;

    const ashAt = addedAt(match);
    // An hour of slack, because near-simultaneous cross-registration should
    // count as movement rather than as ASH-first.
    if (ashAt && ashAt < at - 60 * 60 * 1000) {
      excludedAshFirst += 1;
      continue;
    }

    cohort.moved += 1;
    if (us) cohort.movedUs += 1;
    if (ashAt) gaps.push(Math.round((ashAt - at) / DAY_MS));
  }

  for (const cohort of cohorts) {
    total.pwLeads += cohort.pwLeads;
    total.pwUs += cohort.pwUs;
    total.moved += cohort.moved;
    total.movedUs += cohort.movedUs;
  }

  gaps.sort((a, b) => a - b);

  return {
    connected: true,
    cohorts,
    total,
    medianDaysToMove: gaps.length ? gaps[Math.floor(gaps.length / 2)] : null,
    excludedAshFirst,
    truncated: pw.truncated || ash.truncated,
  };
}
