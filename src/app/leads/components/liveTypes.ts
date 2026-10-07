import type { LeadSource } from "../../../lib/leads/model";

export type LiveStage = "browsing" | "form" | "signup" | "checkout" | "paid";

/** One browser-tab session, as the backend's `live` function stores it. */
export interface LiveSession {
  sid: string;
  vid: string;
  path: string;
  stage: LiveStage;
  maxStage: LiveStage;
  step?: number;
  email?: string;
  name?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
  device?: "mobile" | "desktop";
  returning?: boolean;
  startedAt: number;
  lastSeen: number;
  pages?: number;
  paidAt?: number;
  purchase?: string;
  left?: boolean;
  /** "facebook" for Meta traffic and the Apex Pop funnel, else "other". Absent on sessions before 2026-10-04. */
  channel?: "facebook" | "other";
  landingPath?: string;
  /** The last site pages visited, oldest first. */
  trail?: { p: string; t: number }[];
  accountAt?: number;
  /** The site page that sent them to sign-up when they created an account. */
  accountFrom?: string;
  /** Map dot colour override (the app view colours by module). */
  color?: string;
}

export type LiveCounterKey =
  | "sessions"
  | "returning"
  | "leads"
  | "form"
  | "signup"
  | "checkout"
  | "paid"
  | "signupPassed"
  | "checkoutPassed"
  | "accounts";
export type LiveCounters = Partial<Record<LiveCounterKey, number>>;

/** Which traffic the website views show. */
export type LiveScope = "funnel" | "site";

/** Meta traffic and the Apex Pop funnel: the "Facebook funnel" view. */
export function isFunnelSession(s: LiveSession): boolean {
  if (s.channel) return s.channel === "facebook";
  const src = liveSource(s);
  return src === "facebook-web" || src === "facebook-form" || (s.landingPath ?? s.path).startsWith("/apex-pop");
}

export interface LiveSnapshot {
  now: number;
  day: string;
  active: LiveSession[];
  today: LiveSession[];
  totals: LiveCounters & {
    fb?: LiveCounters;
    pageViews?: Record<string, number>;
    landings?: Record<string, number>;
    accountFrom?: Record<string, number>;
    accountLanding?: Record<string, number>;
  };
}

export const LIVE_STAGE_LABELS: Record<LiveStage, string> = {
  browsing: "Browsing",
  form: "In the form",
  signup: "Signing up",
  checkout: "At checkout",
  paid: "Purchased",
};

/** The visitor's source in the Lead Desk's own vocabulary, so the same logos apply. */
export function liveSource(s: Pick<LiveSession, "source" | "medium" | "referrer">): LeadSource {
  const source = (s.source || "").toLowerCase();
  const medium = (s.medium || "").toLowerCase();
  if (source.includes("primewell")) return "primewell";
  if (source.includes("facebook") || source === "fb" || source.includes("instagram") || source === "meta") {
    return medium === "lead-form" ? "facebook-form" : "facebook-web";
  }
  if (source.includes("google") || source === "ads") return "google";
  if (source.includes("chatgpt") || source.includes("openai")) return "chatgpt";
  if (!source || source === "direct") return "direct";
  return "other";
}

/**
 * Where a session that has ended stopped, for the two drop-off points
 * Stefano wants measured (2026-10-02): reached sign-up and went no further,
 * or reached checkout and did not pay.
 */
export type Bounce = "signup" | "checkout";
export function bounceOf(s: LiveSession, active: boolean): Bounce | null {
  if (active) return null;
  if (s.maxStage === "signup") return "signup";
  if (s.maxStage === "checkout") return "checkout";
  return null;
}
export const BOUNCE_LABELS: Record<Bounce, string> = {
  signup: "Bounced at sign-up",
  checkout: "Bounced at checkout",
};

/** "12.5%", or a dash when there is nothing to divide by. */
export function pct(part: number, whole: number): string {
  if (!whole) return "—";
  const value = (part / whole) * 100;
  return `${value >= 10 || value === 0 ? value.toFixed(0) : value.toFixed(1)}%`;
}

/** "4m 12s", "1h 05m": how long a session has lasted. */
export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

/** The page, in words. */
export function pageLabel(path: string): string {
  if (path.startsWith("/apex-pop/start")) return "Qualifier";
  if (path.startsWith("/apex-pop-facebook")) return "Facebook landing page";
  if (path.startsWith("/apex-pop-reddit")) return "Reddit landing page";
  if (path.startsWith("/apex-scan")) return "Catalog scan landing page";
  if (path.startsWith("/apex-quiz")) return "Seller quiz";
  if (path.startsWith("/apex-pop-primewell") || path === "/primewell") return "PrimeWell page";
  if (path.startsWith("/auth")) return "Sign-up";
  if (path.startsWith("/checkout")) return "Checkout";
  if (path === "/") return "Home";
  if (path.startsWith("/pricing")) return "Pricing";
  if (path.startsWith("/blog/")) return `Blog: ${path.slice(6).replace(/-/g, " ")}`;
  if (path.startsWith("/blog")) return "Blog";
  if (path.startsWith("/tools/fba-calculator")) return "FBA calculator";
  if (path.startsWith("/how-apex-works")) return "Product guide";
  if (path.startsWith("/ai")) return "Apex AI";
  if (path.startsWith("/free-course") || path.startsWith("/zero-to-hero")) return "Free course";
  return path;
}
