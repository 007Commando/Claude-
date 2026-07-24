const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const REQUEST_TIMEOUT_MS = 8000;

// GHL's API doesn't expose email open/click tracking (message status only
// ever shows "delivered", even though GHL clearly tracks opens internally
// via their own redirect links). What IS available per conversation is
// lastMessageDirection ("inbound" means the lead replied — a stronger signal
// than a passive open anyway) and lastMessageDate. Temperature is built from
// that: has this lead ever replied, and how recently did anything happen.
export type Temperature = "cold" | "cool" | "warm" | "hot" | "very_hot";

export interface EngagementResult {
  temperature: Temperature;
  lastMessageAt: string | null;
  hasReplied: boolean;
}

interface GhlConversation {
  lastMessageDate?: number;
  lastMessageDirection?: "inbound" | "outbound";
}

// Confirmed via live testing against ~1000 real contacts: GHL's rate limit
// on /conversations/search is much tighter than /contacts/ — concurrency 5
// with no retry caused a ~100% 429 rate. Retrying with backoff (honoring
// Retry-After when GHL sends one) is what actually gets these to succeed.
const MAX_429_RETRIES = 5;
const BASE_BACKOFF_MS = 800;

async function ghlFetch<T>(path: string, token: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${GHL_BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: GHL_VERSION,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 429 && attempt < MAX_429_RETRIES) {
      const retryAfterSec = Number(res.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? retryAfterSec * 1000
        : BASE_BACKOFF_MS * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GHL ${path} failed: ${res.status} ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }
}

function computeTemperature(daysSinceLastMessage: number | null, hasReplied: boolean): Temperature {
  if (daysSinceLastMessage == null) return "cold"; // never contacted at all

  // Warm/Hot/Very Hot all require an actual reply (SMS or email) from the
  // lead — outbound-only activity from us, no matter how recent, never counts
  // as "engaged." Recency among repliers decides how warm it still is, and it
  // cools back down to "cold" on its own the longer nothing happens (this is
  // what makes the badge "go away" as they stop responding, without us
  // needing to track or expire anything explicitly).
  if (hasReplied) {
    if (daysSinceLastMessage <= 2) return "very_hot";
    if (daysSinceLastMessage <= 7) return "hot";
    if (daysSinceLastMessage <= 30) return "warm";
    return "cold";
  }

  // Never replied — the best this can be is "cool" (something outbound went
  // out recently), never warmer.
  if (daysSinceLastMessage <= 14) return "cool";
  return "cold";
}

// Empirically tuned: testing against ~1000 real PrimeWell contacts showed
// concurrency 5 with no retry hit a ~100% 429 rate on /conversations/search
// (much stricter than /contacts/ or Stripe). Combined with the retry/backoff
// above, 3 concurrent requests reliably clears the whole list without errors.
const CONCURRENCY = 3;

/** Looks up reply/engagement-based temperature per GHL contact ID, bounded to a few concurrent requests. */
export async function getLeadEngagement(
  contactIds: string[],
  token: string,
  locationId: string,
): Promise<Map<string, EngagementResult>> {
  const result = new Map<string, EngagementResult>();
  const uniqueIds = [...new Set(contactIds)];
  if (!token || !locationId || uniqueIds.length === 0) return result;

  let cursor = 0;

  async function worker() {
    while (cursor < uniqueIds.length) {
      const contactId = uniqueIds[cursor++];
      try {
        const data = await ghlFetch<{ conversations: GhlConversation[] }>(
          `/conversations/search?locationId=${locationId}&contactId=${contactId}&limit=10`,
          token,
        );
        const convos = data.conversations ?? [];
        if (convos.length === 0) {
          result.set(contactId, { temperature: "cold", lastMessageAt: null, hasReplied: false });
          continue;
        }

        const latest = convos.reduce((a, b) => ((b.lastMessageDate ?? 0) > (a.lastMessageDate ?? 0) ? b : a));
        const hasReplied = convos.some((c) => c.lastMessageDirection === "inbound");
        const daysSince = latest.lastMessageDate != null ? (Date.now() - latest.lastMessageDate) / 86_400_000 : null;

        result.set(contactId, {
          temperature: computeTemperature(daysSince, hasReplied),
          lastMessageAt: latest.lastMessageDate ? new Date(latest.lastMessageDate).toISOString() : null,
          hasReplied,
        });
      } catch (err) {
        // Skip this contact on error — it's simply treated as unknown/cold downstream.
        console.error(`[ghl-engagement] lookup failed for ${contactId}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, uniqueIds.length) }, worker));
  return result;
}
