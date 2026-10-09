/**
 * Sales calls as Lead Desk shows them. A backend job stores every call the
 * sales rep makes through GoHighLevel's phone system and serves it through
 * /internal/sales-calls. Pure types, labels and small helpers: nothing here
 * does I/O, so client components can import it too.
 */

export type CallOutcome =
  | "interested"
  | "booked_call"
  | "call_back"
  | "not_interested"
  | "not_a_fit"
  | "no_answer_voicemail"
  | "wrong_number";
export type CallInterest = "hot" | "warm" | "cold";
export type CallSellerType = "selling_wholesale" | "selling_other" | "beginner" | "unknown";

export interface CallTranscriptLine {
  channel: number;
  startMs: number;
  text: string;
}

export interface SalesCall {
  messageId: string;
  conversationId: string;
  contactId: string;
  contactName: string | null;
  contactEmail: string | null;
  userId: string;
  userName: string;
  direction: "outbound" | "inbound";
  status: string;
  durationSec: number | null;
  startedAt: string;
  connected: boolean;
  transcriptStatus: "pending" | "ready" | "none" | "error";
  transcript?: CallTranscriptLine[] | null;
  summaryStatus: "pending" | "ready" | "skipped" | "no-key" | "error";
  summary: {
    outcome: CallOutcome;
    interest: CallInterest;
    sellerType: CallSellerType;
    objection: string;
    nextStep: string;
    followUpDate: string;
    summary: string;
  } | null;
}

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  interested: "Interested",
  booked_call: "Booked",
  call_back: "Call back",
  not_interested: "Not interested",
  not_a_fit: "Not a fit",
  no_answer_voicemail: "No answer",
  wrong_number: "Wrong number",
};

export const CALL_INTEREST_LABELS: Record<CallInterest, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const CALL_SELLER_TYPE_LABELS: Record<CallSellerType, string> = {
  selling_wholesale: "Wholesale seller",
  selling_other: "Other seller",
  beginner: "Beginner",
  unknown: "Unknown",
};

/** How an outcome reads at a glance: good news, still open, or closed. */
export type CallOutcomeTone = "good" | "open" | "closed" | "quiet";

export const CALL_OUTCOME_TONES: Record<CallOutcome, CallOutcomeTone> = {
  interested: "good",
  booked_call: "good",
  call_back: "open",
  not_interested: "closed",
  not_a_fit: "closed",
  wrong_number: "closed",
  no_answer_voicemail: "quiet",
};

/** "6m 12s" / "45s" / "1h 2m"; a dash when the length is unknown. */
export function formatDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return "–";
  const total = Math.round(sec);
  if (total < 60) return `${total}s`;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

/** Same, without the seconds once a call passes a minute: "45s" / "6m" / "1h 2m". For tight spots like a card tag. */
export function formatDurationShort(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return "–";
  const total = Math.round(sec);
  if (total < 60) return `${total}s`;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** "mm:ss" for a transcript timestamp. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Compact time since: "now", "12m", "3h", "2d". */
export function sinceLabel(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.floor((now - t) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const NY_STAMP = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const NY_TIME = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
const NY_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" });

/** "Oct 8, 2:14 PM" in New York time. */
export function formatCallStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return NY_STAMP.format(d);
}

/** "2:14 PM" in New York time. */
export function formatCallClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return NY_TIME.format(d);
}

/** The New York calendar day of a timestamp, as YYYY-MM-DD. */
export function nyDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : NY_DAY.format(d);
}

/** A follow-up date as YYYY-MM-DD, or null when the AI left it blank or wrote something else. */
export function followUpDay(value: string | null | undefined): string | null {
  const m = (value ?? "").match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** "Oct 8" for a YYYY-MM-DD day, without a time zone shifting it. */
export function formatDayLabel(day: string): string {
  const [y, mo, d] = day.split("-").map(Number);
  if (!y || !mo || !d) return day;
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
}

/** Calls grouped by GHL contact id, each list newest first. */
export function indexCallsByContact(calls: SalesCall[]): Record<string, SalesCall[]> {
  const out: Record<string, SalesCall[]> = {};
  for (const call of calls) (out[call.contactId] ??= []).push(call);
  for (const list of Object.values(out)) list.sort((a, b) => (a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0));
  return out;
}

/** The calls with one lead, newest first. Only Apex GHL contacts get calls. */
export function callsForLead(
  lead: { ghlContactId: string | null; ghlLocation: "apex" | "primewell" | null },
  byContact: Record<string, SalesCall[]> | undefined,
): SalesCall[] {
  if (!byContact || !lead.ghlContactId || lead.ghlLocation !== "apex") return NO_CALLS;
  return byContact[lead.ghlContactId] ?? NO_CALLS;
}

const NO_CALLS: SalesCall[] = [];

/** The kind of call that counts as a good one: a hot read, or the lead said yes. */
export function isHotCall(call: SalesCall): boolean {
  const s = call.summary;
  return Boolean(s && (s.interest === "hot" || s.outcome === "interested" || s.outcome === "booked_call"));
}

export function isBookedCall(call: SalesCall): boolean {
  return call.summary?.outcome === "booked_call";
}
