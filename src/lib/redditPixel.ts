/**
 * Reddit pixel events, for the Reddit ads test (October 2026).
 *
 * The pixel itself is loaded by layout.tsx in production when
 * NEXT_PUBLIC_REDDIT_PIXEL_ID is set; until then `window.rdt` does not exist
 * and every call here does nothing. The backend sends the same SignUp through
 * Reddit's Conversions API with the same conversion id
 * (reg-<first 24 hex of sha256(email)>, see metaEventId in the backend), so
 * Reddit counts one signup, not two. Trial starts are reported only from the
 * backend, where Stripe's webhook knows they happened.
 */

type RedditEvent = "Lead" | "SignUp" | "Purchase";

declare global {
  interface Window {
    rdt?: (...args: unknown[]) => void;
  }
}

export function trackReddit(event: RedditEvent, opts: { conversionId?: string; value?: number } = {}): void {
  if (typeof window === "undefined" || !window.rdt) return;
  window.rdt("track", event, {
    ...(opts.conversionId ? { conversionId: opts.conversionId } : {}),
    ...(opts.value !== undefined ? { value: opts.value, currency: "USD" } : {}),
  });
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The account-created event, with the id the backend's SIGN_UP also carries. */
export function trackRedditSignUp(email?: string): void {
  if (typeof window === "undefined" || !window.rdt) return;
  if (!email || !crypto?.subtle) {
    trackReddit("SignUp");
    return;
  }
  sha256Hex(email)
    .then((hex) => trackReddit("SignUp", { conversionId: `reg-${hex.slice(0, 24)}` }))
    .catch(() => trackReddit("SignUp"));
}
