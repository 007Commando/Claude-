/**
 * Which leads have actually booked time with you.
 *
 * Calendly's API cannot answer "has this email booked?" directly — a scheduled
 * event does not carry its invitees, so the emails only come from a second
 * call per event. Asking per lead would therefore be two requests each, and a
 * page of 100 leads would be 200 round trips.
 *
 * So it works the other way around: fetch every event in the window once,
 * collect the invitee emails, and build one email → meeting map that every
 * lead is then matched against for free. One person's calendar is a small
 * enough dataset for that to be the cheap option.
 */

const API = "https://api.calendly.com";

/** How far back and forward to look. "Previously booked" is the point, so both. */
const LOOKBACK_DAYS = 365;
const LOOKAHEAD_DAYS = 365;

/**
 * The map is rebuilt at most this often. The dashboard enriches leads a page
 * at a time, so without this a single screen would refetch the whole calendar
 * several times over.
 */
const CACHE_TTL_MS = 5 * 60_000;

/** Calendly rate-limits; invitee calls run in small batches rather than all at once. */
const INVITEE_CONCURRENCY = 5;

export interface BookedMeeting {
  /** Event start, ISO. */
  startsAt: string;
  /** Calendly's own status — a cancelled booking is still worth seeing. */
  status: "active" | "canceled";
  /** Event type name, e.g. "30 Minute Meeting". */
  eventName: string | null;
  /** True when the meeting is still ahead of now. */
  isUpcoming: boolean;
}

interface CalendlyEvent {
  uri: string;
  name?: string | null;
  start_time: string;
  status: string;
}

interface CalendlyInvitee {
  email?: string | null;
  status?: string | null;
}

let cache: { at: number; map: Map<string, BookedMeeting> } | null = null;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/** The token belongs to one person, so /users/me gives both URIs we need. */
async function getCurrentUser(token: string) {
  const res = await fetch(`${API}/users/me`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new Error(`Calendly /users/me failed: ${res.status}`);
  }
  const body = (await res.json()) as {
    resource?: { uri?: string; current_organization?: string };
  };
  return {
    userUri: body.resource?.uri ?? null,
    organizationUri: body.resource?.current_organization ?? null,
  };
}

async function fetchAllEvents(
  token: string,
  userUri: string,
): Promise<CalendlyEvent[]> {
  const events: CalendlyEvent[] = [];
  const minStart = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();
  const maxStart = new Date(Date.now() + LOOKAHEAD_DAYS * 86_400_000).toISOString();

  // Scoped to the user rather than the organization: this column answers
  // "has this lead met *me*", which is the question being asked.
  let url: string | null =
    `${API}/scheduled_events?user=${encodeURIComponent(userUri)}` +
    `&min_start_time=${encodeURIComponent(minStart)}` +
    `&max_start_time=${encodeURIComponent(maxStart)}&count=100`;

  // Bounded so a pagination bug can never spin forever.
  for (let page = 0; url && page < 40; page++) {
    const res: Response = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) throw new Error(`Calendly /scheduled_events failed: ${res.status}`);
    const body = (await res.json()) as {
      collection?: CalendlyEvent[];
      pagination?: { next_page?: string | null };
    };
    events.push(...(body.collection ?? []));
    url = body.pagination?.next_page ?? null;
  }

  return events;
}

async function fetchInvitees(
  token: string,
  eventUri: string,
): Promise<CalendlyInvitee[]> {
  const res = await fetch(`${eventUri}/invitees?count=100`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { collection?: CalendlyInvitee[] };
  return body.collection ?? [];
}

/**
 * email (lowercased) → the meeting worth showing.
 *
 * When someone has booked more than once the upcoming one wins, then the most
 * recent past one. Seeing "Friday" matters more than seeing a call from March.
 */
export async function getBookedMeetings(): Promise<Map<string, BookedMeeting>> {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) return new Map();

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.map;

  const { userUri } = await getCurrentUser(token);
  if (!userUri) return new Map();

  const events = await fetchAllEvents(token, userUri);
  const map = new Map<string, BookedMeeting>();
  const now = Date.now();

  for (let i = 0; i < events.length; i += INVITEE_CONCURRENCY) {
    const slice = events.slice(i, i + INVITEE_CONCURRENCY);
    const results = await Promise.all(
      slice.map(async (event) => ({
        event,
        invitees: await fetchInvitees(token, event.uri),
      })),
    );

    for (const { event, invitees } of results) {
      const startsAt = event.start_time;
      const isUpcoming = new Date(startsAt).getTime() > now;
      const meeting: BookedMeeting = {
        startsAt,
        status: event.status === "canceled" ? "canceled" : "active",
        eventName: event.name ?? null,
        isUpcoming,
      };

      for (const invitee of invitees) {
        const email = invitee.email?.trim().toLowerCase();
        if (!email) continue;

        const existing = map.get(email);
        if (!existing || isBetter(meeting, existing)) map.set(email, meeting);
      }
    }
  }

  cache = { at: Date.now(), map };
  return map;
}

/** Upcoming beats past; within the same kind, the nearer date wins. */
function isBetter(candidate: BookedMeeting, existing: BookedMeeting) {
  if (candidate.isUpcoming !== existing.isUpcoming) return candidate.isUpcoming;
  const a = new Date(candidate.startsAt).getTime();
  const b = new Date(existing.startsAt).getTime();
  return candidate.isUpcoming ? a < b : a > b;
}

/** Lets a failing calendar be reported without pretending nobody has booked. */
export function isCalendlyConfigured() {
  return Boolean(process.env.CALENDLY_API_TOKEN);
}
