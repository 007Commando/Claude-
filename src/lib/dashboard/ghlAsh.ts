import { deriveTrafficSource, type GhlAttribution } from "./leadSource";

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

// Bounds how many contacts get pulled in total. Fetching contacts themselves
// is cheap (~3s for ~1000, measured) — the expensive part is the per-contact
// Stripe lookup, which is enriched lazily per table page instead (see
// /api/dashboard/primewell-stripe-status), so this cap just needs generous
// headroom over current volume, not a tight bound on request time.
const MAX_CONTACTS = 2000;
const PAGE_SIZE = 100;
const PAGE_TIMEOUT_MS = 6000;

interface GhlContact {
  id: string;
  email?: string;
  phone?: string;
  contactName?: string;
  firstName?: string;
  lastName?: string;
  dateAdded?: string;
  // Present (non-empty) whenever the contact has opted out on at least one
  // channel — e.g. {SMS: {status: "permanent", message: "STOP_KEYWORD"}} for
  // a lead who replied STOP. A clean contact has dndSettings: {}.
  dndSettings?: Record<string, { status?: string }>;
  attributions?: GhlAttribution[];
}

export interface AshContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateAdded: string;
  optedOut: boolean;
  sourceLabel: string;
}

interface GhlContactsPage {
  contacts: GhlContact[];
  meta: { total: number; startAfterId?: string | null; startAfter?: number | null };
}

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

// GHL's contacts endpoint is occasionally slow/flaky on paginated requests
// for larger accounts. Retrying costs up to 2x PAGE_TIMEOUT_MS, so only the
// first page (whose failure means "not connected" — worth the wait) gets a
// retry; later pages fail fast and fall back to the partial-result path.
async function ghlFetchWithRetry<T>(path: string, token: string, retry: boolean): Promise<T> {
  if (!retry) return ghlFetchOnce<T>(path, token);
  try {
    return await ghlFetchOnce<T>(path, token);
  } catch {
    return ghlFetchOnce<T>(path, token);
  }
}

export interface AshLeadsResult {
  connected: boolean;
  error?: string;
  totalLeads: number;
  newLeads7d: number;
  newLeads30d: number;
  emails: string[];
  emailsTruncated: boolean;
  contacts: AshContact[];
  contactsTruncated: boolean;
}

const empty: AshLeadsResult = {
  connected: false,
  totalLeads: 0,
  newLeads7d: 0,
  newLeads30d: 0,
  emails: [],
  emailsTruncated: false,
  contacts: [],
  contactsTruncated: false,
};

export async function getAshLeads(): Promise<AshLeadsResult> {
  const token = process.env.GHL_ASH_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_ASH_LOCATION_ID;

  if (!token || !locationId) {
    return {
      ...empty,
      error: "GHL_ASH_PRIVATE_INTEGRATION_TOKEN or GHL_ASH_LOCATION_ID is not set",
    };
  }

  const contacts: GhlContact[] = [];
  let startAfterId: string | undefined;
  let startAfter: number | undefined;
  let total = 0;
  let stoppedEarly = false;

  while (contacts.length < MAX_CONTACTS) {
    const cursor =
      startAfterId && startAfter ? `&startAfterId=${startAfterId}&startAfter=${startAfter}` : "";
    let page: GhlContactsPage;
    try {
      page = await ghlFetchWithRetry<GhlContactsPage>(
        `/contacts/?locationId=${locationId}&limit=${PAGE_SIZE}${cursor}`,
        token,
        contacts.length === 0,
      );
    } catch (err) {
      if (contacts.length === 0) {
        return { ...empty, error: err instanceof Error ? err.message : "Failed to reach Amazon Success Hub's GHL" };
      }
      // Later page failed after fetching some contacts already — keep the
      // partial result rather than throwing away everything.
      stoppedEarly = true;
      break;
    }

    contacts.push(...page.contacts);
    total = page.meta?.total ?? contacts.length;

    if (page.contacts.length < PAGE_SIZE || !page.meta?.startAfterId) break;
    startAfterId = page.meta.startAfterId;
    startAfter = page.meta.startAfter ?? undefined;
  }

  const now = Date.now();
  const since7d = now - 7 * 24 * 60 * 60 * 1000;
  const since30d = now - 30 * 24 * 60 * 60 * 1000;

  const newLeads7d = contacts.filter((c) => c.dateAdded && new Date(c.dateAdded).getTime() >= since7d).length;
  const newLeads30d = contacts.filter(
    (c) => c.dateAdded && new Date(c.dateAdded).getTime() >= since30d,
  ).length;

  const contactsWithEmail = contacts.filter((c) => c.email);

  return {
    connected: true,
    totalLeads: total,
    newLeads7d,
    newLeads30d,
    emails: contactsWithEmail.map((c) => c.email as string),
    emailsTruncated: stoppedEarly || total > contacts.length,
    contacts: contactsWithEmail.map((c) => ({
      id: c.id,
      name: (c.contactName || [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email) as string,
      email: c.email as string,
      phone: c.phone ?? null,
      dateAdded: c.dateAdded ?? "",
      optedOut: Object.keys(c.dndSettings ?? {}).length > 0,
      sourceLabel: deriveTrafficSource(c.attributions),
    })),
    contactsTruncated: stoppedEarly || total > contactsWithEmail.length,
  };
}
