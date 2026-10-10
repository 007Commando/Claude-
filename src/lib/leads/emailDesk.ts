/**
 * Lead Desk's Emails tab reads everything from the backend's internal email
 * desk (/internal/emails), which holds the Mandrill key, the click records and
 * the campaigns' own dry runs. Server-side only: the internal key never
 * reaches the browser.
 */

const BASE_URL = process.env.APEX_API_URL ?? "https://app.apexapplications.io/api";

export type EmailDeskAction = "preview" | "activity" | "queue";

export async function emailDeskFetch(path: string, params: Record<string, string>): Promise<{ status: number; body: unknown }> {
  const key = process.env.APEX_INTERNAL_API_KEY;
  if (!key) return { status: 503, body: { error: "APEX_INTERNAL_API_KEY is not set" } };
  const qs = new URLSearchParams({ ...params, apiKey: key });
  try {
    const res = await fetch(`${BASE_URL}/internal/emails${path}?${qs}`, { cache: "no-store" });
    const body = await res.json().catch(() => ({ error: `Backend answered ${res.status}` }));
    return { status: res.status, body };
  } catch (err) {
    return { status: 502, body: { error: err instanceof Error ? err.message : "Backend unreachable" } };
  }
}

export interface DeskTemplate {
  template: string;
  label?: string;
}

export interface DeskEmail {
  id: string;
  name: string;
  group: string;
  templates: DeskTemplate[];
  when: string;
  who: string;
  stops: string;
  gate?: string;
  schedule?: string;
  state: "live" | "dry" | "off" | "always";
  /** "available" when "Who's next" can run, else the reason it can't; null when the email has no schedule. */
  queue: string | null;
}

export interface DeskWindow {
  sent: number;
  delivered: number;
  uniqueOpens: number;
  opens: number;
  bounces: number;
  unsubs: number;
  humanClicks: number;
  clickers: number;
}

export interface DeskList {
  generatedAt: string;
  emails: DeskEmail[];
  stats: Record<string, { d30: DeskWindow; d14: DeskWindow; lastSent: string | null }>;
}

export interface DeskSend {
  ts: number;
  template: string;
  email: string;
  state: string;
  opens: number;
  subject: string;
}

export interface DeskClick {
  email: string;
  url: string;
  clickedAt: string;
  likelyBot: boolean;
  userAgent: string;
}

export interface DeskActivity {
  generatedAt: string;
  sends: DeskSend[];
  clicks: DeskClick[];
}

export interface DeskQueue {
  id: string;
  generatedAt: string;
  tookMs: number;
  recipients: { email: string; name?: string; template: string; detail?: string }[];
  result: Record<string, unknown>;
}
