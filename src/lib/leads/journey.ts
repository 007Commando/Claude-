import { channelFromGhlSource, type LeadSource } from "./model";

/**
 * The full history GHL keeps for one person, for the lead drawer.
 *
 * The board's own touches only know when each contact record was created.
 * GHL knows more, per location: every form submission with its date, the page
 * it was sent from and the utm/referrer of the visit, and the first and the
 * latest visit attribution on the contact. That is what answers "applied on
 * PrimeWell in August, came back from a Facebook ad in October". Fetched on
 * demand for one lead, because it costs a few requests per contact.
 */

const GHL = "https://services.leadconnectorhq.com";

export interface JourneyEvent {
  at: string | null;
  location: "apex" | "primewell";
  kind: "contact" | "form" | "survey" | "first-visit" | "latest-visit";
  title: string;
  channel: LeadSource | null;
  /** Short facts: page, referrer, utm campaign/ad, how it was added. */
  details: string[];
}

interface Attribution {
  sessionSource?: string | null;
  medium?: string | null;
  url?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
}

function locations(): { name: "apex" | "primewell"; token: string; id: string }[] {
  const out: { name: "apex" | "primewell"; token: string; id: string }[] = [];
  if (process.env.GHL_PRIVATE_INTEGRATION_TOKEN && process.env.GHL_LOCATION_ID) {
    out.push({ name: "apex", token: process.env.GHL_PRIVATE_INTEGRATION_TOKEN, id: process.env.GHL_LOCATION_ID });
  }
  if (process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN && process.env.GHL_PRIMEWELL_LOCATION_ID) {
    out.push({
      name: "primewell",
      token: process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN,
      id: process.env.GHL_PRIMEWELL_LOCATION_ID,
    });
  }
  return out;
}

async function ghl<T>(token: string, path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${GHL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Form names per location, cached for an hour: submissions only carry the id. */
const formNames = new Map<string, { at: number; names: Map<string, string> }>();
async function formNameMap(token: string, locationId: string): Promise<Map<string, string>> {
  const hit = formNames.get(locationId);
  if (hit && Date.now() - hit.at < 60 * 60 * 1000) return hit.names;
  const names = new Map<string, string>();
  for (const kind of ["forms", "surveys"]) {
    const data = await ghl<{ forms?: { id: string; name: string }[]; surveys?: { id: string; name: string }[] }>(
      token,
      `/${kind}/?locationId=${encodeURIComponent(locationId)}&limit=50`,
    );
    for (const f of [...(data?.forms ?? []), ...(data?.surveys ?? [])]) names.set(f.id, f.name);
  }
  formNames.set(locationId, { at: Date.now(), names });
  return names;
}

const host = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
};

function attributionFacts(a: Attribution | null | undefined): { channel: LeadSource | null; details: string[] } {
  if (!a) return { channel: null, details: [] };
  const details: string[] = [];
  if (a.sessionSource) details.push(a.sessionSource);
  if (a.url) details.push(`Page: ${host(a.url)}`);
  if (a.referrer) details.push(`From: ${host(a.referrer)}`);
  const utm = [a.utmSource, a.utmCampaign, a.utmContent].filter(Boolean).join(" / ");
  if (utm) details.push(`utm: ${utm}`);
  if (a.fbclid) details.push("Facebook ad click");
  if (a.gclid) details.push("Google ad click");
  if (a.medium && !a.sessionSource) details.push(a.medium.replace(/_/g, " "));
  const channel =
    (a.fbclid ? "facebook-web" : null) ??
    (a.gclid ? "google" : null) ??
    channelFromGhlSource(a.utmSource) ??
    channelFromGhlSource(a.sessionSource) ??
    channelFromGhlSource(a.referrer) ??
    channelFromGhlSource(a.url);
  return { channel, details };
}

interface Submission {
  createdAt?: string;
  formId?: string;
  surveyId?: string;
  others?: { eventData?: Record<string, unknown> };
}

export async function getJourney(email: string): Promise<JourneyEvent[]> {
  const events: JourneyEvent[] = [];
  const e = email.trim().toLowerCase();

  await Promise.all(
    locations().map(async (loc) => {
      const where = loc.name === "primewell" ? "PrimeWell" : "Apex";
      const found = await ghl<{ contacts?: { id: string; dateAdded?: string; source?: string }[] }>(loc.token, "/contacts/search", {
        method: "POST",
        body: JSON.stringify({ locationId: loc.id, pageLimit: 5, filters: [{ field: "email", operator: "eq", value: e }] }),
      });
      const contacts = found?.contacts ?? [];
      if (!contacts.length) return;

      const names = await formNameMap(loc.token, loc.id);
      await Promise.all(
        contacts.map(async (c) => {
          const detail = await ghl<{
            contact?: { dateAdded?: string; source?: string; attributionSource?: Attribution; lastAttributionSource?: Attribution };
          }>(loc.token, `/contacts/${c.id}`);
          const contact = detail?.contact;
          const first = attributionFacts(contact?.attributionSource);
          events.push({
            at: contact?.dateAdded ?? c.dateAdded ?? null,
            location: loc.name,
            kind: "contact",
            title: `Added to ${where} GHL`,
            channel: loc.name === "primewell" ? "primewell" : (channelFromGhlSource(contact?.source ?? c.source) ?? first.channel),
            details: [contact?.source ?? c.source, ...first.details].filter((d): d is string => Boolean(d)),
          });
          const last = contact?.lastAttributionSource;
          if (last && JSON.stringify(last) !== JSON.stringify(contact?.attributionSource)) {
            const facts = attributionFacts(last);
            events.push({ at: null, location: loc.name, kind: "latest-visit", title: `Latest visit (${where})`, channel: facts.channel, details: facts.details });
          }
        }),
      );

      for (const kind of ["forms", "surveys"] as const) {
        const data = await ghl<{ submissions?: Submission[] }>(
          loc.token,
          `/${kind}/submissions?locationId=${encodeURIComponent(loc.id)}&q=${encodeURIComponent(e)}&limit=50`,
        );
        for (const s of data?.submissions ?? []) {
          const ev = (s.others?.eventData ?? {}) as Record<string, unknown>;
          const page = ev.page as { url?: string } | undefined;
          const facts = attributionFacts({
            sessionSource: (ev.source as string) ?? null,
            url: page?.url ?? (ev.url as string) ?? null,
            referrer: (ev.referrer as string) ?? null,
            utmSource: (ev.utm_source as string) ?? null,
            utmCampaign: (ev.utm_campaign as string) ?? null,
            utmContent: (ev.utm_content as string) ?? null,
            fbclid: (ev.fbclid as string) ?? null,
            gclid: (ev.gclid as string) ?? null,
          });
          const id = s.formId ?? s.surveyId ?? "";
          events.push({
            at: s.createdAt ?? null,
            location: loc.name,
            kind: kind === "forms" ? "form" : "survey",
            title: `${kind === "forms" ? "Submitted" : "Completed"} "${names.get(id) ?? (kind === "forms" ? "a form" : "a survey")}" (${where})`,
            channel: loc.name === "primewell" && !facts.channel ? "primewell" : facts.channel,
            details: facts.details,
          });
        }
      }
    }),
  );

  return events.sort((a, b) => {
    if (!a.at && !b.at) return 0;
    if (!a.at) return 1;
    if (!b.at) return -1;
    return a.at < b.at ? -1 : 1;
  });
}
