const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const REQUEST_TIMEOUT_MS = 8000;

// GHL's API doesn't expose email open/click tracking (message status only
// ever shows "delivered", even though GHL clearly tracks opens internally
// via their own redirect links). What IS available is actual message-level
// direction — has this lead ever sent us an inbound SMS or email, and how
// recently did THEY (not us) last do that. Temperature is built from that.
export type Temperature = "cold" | "cool" | "warm" | "hot" | "very_hot";

export interface EngagementResult {
  temperature: Temperature;
  lastMessageAt: string | null;
  hasReplied: boolean;
}

interface GhlConversation {
  id: string;
}

interface GhlMessage {
  direction?: "inbound" | "outbound";
  messageType?: string; // "TYPE_SMS" | "TYPE_EMAIL" | "TYPE_CALL" | ...
  dateAdded?: string;
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

function computeTemperature(
  hasReplied: boolean,
  daysSinceReply: number | null,
  daysSinceAnyMessage: number | null,
): Temperature {
  // Warm/Hot/Very Hot all require an actual reply (SMS or email) from the
  // lead — outbound-only activity from us, no matter how recent, never counts
  // as "engaged." Recency is measured from THEIR most recent reply specifically,
  // not the conversation's last message overall — a follow-up we send right
  // after they reply must never mask that they engaged. It cools back down to
  // "cold" on its own the longer nothing happens, with no expiry to track.
  if (hasReplied && daysSinceReply != null) {
    if (daysSinceReply <= 2) return "very_hot";
    if (daysSinceReply <= 7) return "hot";
    if (daysSinceReply <= 30) return "warm";
    return "cold";
  }

  // Never replied — the best this can be is "cool" (something outbound went
  // out recently), never warmer.
  if (daysSinceAnyMessage != null && daysSinceAnyMessage <= 14) return "cool";
  return "cold";
}

// Only these count as "messaging" for reply detection, per the requirement
// that Warm/Hot/Very Hot reflect replies to SMS or email specifically — an
// inbound phone call, for instance, isn't the same signal as a text back.
const REPLIABLE_MESSAGE_TYPES = new Set(["TYPE_SMS", "TYPE_EMAIL"]);

// GHL returns messages newest-first; this is generous enough to reach any
// realistic recent reply without paginating deeper (irrelevant anyway — a
// reply older than this page is already well past any "engaged" threshold).
const MESSAGE_FETCH_LIMIT = 20;

async function fetchConversationMessages(conversationId: string, token: string): Promise<GhlMessage[]> {
  const data = await ghlFetch<{ messages: { messages: GhlMessage[] } }>(
    `/conversations/${conversationId}/messages?limit=${MESSAGE_FETCH_LIMIT}`,
    token,
  );
  return data.messages?.messages ?? [];
}

// Empirically tuned: testing against ~1000 real PrimeWell contacts showed
// concurrency 5 with no retry hit a ~100% 429 rate on /conversations/search
// (much stricter than /contacts/ or Stripe). Fetching actual messages (this
// module now does 1 conversations/search call + 1 messages call per
// conversation, roughly doubling request volume) makes the same rate limit
// even easier to trip, so concurrency is kept lower here than it otherwise
// could be — combined with the retry/backoff above, this reliably clears
// the whole list without errors, just more slowly.
const CONCURRENCY = 2;

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
        const convoData = await ghlFetch<{ conversations: GhlConversation[] }>(
          `/conversations/search?locationId=${locationId}&contactId=${contactId}&limit=10`,
          token,
        );
        const conversations = convoData.conversations ?? [];
        if (conversations.length === 0) {
          result.set(contactId, { temperature: "cold", lastMessageAt: null, hasReplied: false });
          continue;
        }

        const messageLists = await Promise.all(
          conversations.map((c) => fetchConversationMessages(c.id, token)),
        );
        const messages = messageLists
          .flat()
          .filter((m) => m.messageType && REPLIABLE_MESSAGE_TYPES.has(m.messageType));

        const toTs = (d?: string) => (d ? new Date(d).getTime() : null);
        const inbound = messages.filter((m) => m.direction === "inbound");
        const lastInboundTs = inbound.length
          ? Math.max(...inbound.map((m) => toTs(m.dateAdded) ?? 0))
          : null;
        const lastAnyTs = messages.length ? Math.max(...messages.map((m) => toTs(m.dateAdded) ?? 0)) : null;

        const hasReplied = inbound.length > 0;
        const daysSinceReply = lastInboundTs != null ? (Date.now() - lastInboundTs) / 86_400_000 : null;
        const daysSinceAny = lastAnyTs != null ? (Date.now() - lastAnyTs) / 86_400_000 : null;

        result.set(contactId, {
          temperature: computeTemperature(hasReplied, daysSinceReply, daysSinceAny),
          lastMessageAt: lastAnyTs != null ? new Date(lastAnyTs).toISOString() : null,
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
