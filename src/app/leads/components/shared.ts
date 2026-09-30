/**
 * Labels, tag colours and small formatting helpers shared across Lead Desk's
 * board and table views. Nothing here does I/O.
 */

import type { ActivationTier, Lead, LeadSource, SellerType, Stage } from "../../../lib/leads/model";

export const SOURCE_LABELS: Record<LeadSource, string> = {
  primewell: "PrimeWell",
  "facebook-form": "Facebook form",
  "facebook-web": "Facebook web",
  google: "Google",
  chatgpt: "ChatGPT",
  ash: "Amazon Success Hub",
  direct: "Direct",
  other: "Other",
};

/** Short tags for the board card's line 1 — see apex-short-tooltips: two words, max. */
export const SOURCE_ABBR: Record<LeadSource, string> = {
  primewell: "PW",
  "facebook-form": "FB form",
  "facebook-web": "FB web",
  google: "Google",
  chatgpt: "ChatGPT",
  ash: "ASH",
  direct: "Direct",
  other: "Other",
};

export const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  registered: "Account, no trial",
  trial: "Trialing",
  customer: "Customer",
  churned: "Churned",
};

export const STAGE_SHORT_LABELS: Record<Stage, string> = {
  lead: "Leads",
  registered: "Account, no trial",
  trial: "Trialing",
  customer: "Customers",
  churned: "Churned",
};

export const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  selling: "Selling",
  beginner: "Beginner",
  unknown: "Unknown",
};

export const STAGES: Stage[] = ["lead", "registered", "trial", "customer", "churned"];
export const ALL_SOURCES: LeadSource[] = ["primewell", "facebook-form", "facebook-web", "google", "chatgpt", "direct", "other"];
export const ALL_SELLER_TYPES: SellerType[] = ["selling", "beginner", "unknown"];

export function stageColorVar(stage: Stage): string {
  return `var(--ld-stage-${stage})`;
}

/**
 * Border colours for the four activation milestones (Stefano's spec,
 * highest-priority first) — reused by the board card border, the table
 * row's left bar, the KPI-strip legend, and the drawer's Activation section.
 */
export const ACTIVATION_COLORS: Record<ActivationTier, string> = {
  connected: "#7c3aed",
  database: "#2563eb",
  scanned: "#16a34a",
  emailed: "#eab308",
};

export const ACTIVATION_LABELS: Record<ActivationTier, string> = {
  connected: "Seller Central",
  database: "Database",
  scanned: "First scan",
  emailed: "Vendor email",
};

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Same as money() but with 2 decimals — used for small per-lead costs where whole dollars round away the signal. */
export function moneyPrecise(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Plain integer with thousands separators. */
export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

const MS_DAY = 86_400_000;

/** Whole days between `iso` and now, floored (never negative-displayed — callers decide phrasing). */
export function daysBetween(iso: string | null, now: number = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((now - t) / MS_DAY);
}

/**
 * "Called 2d ago" / "Never" — used on both the card and the drawer.
 *
 * lastOutreachAt is a plain "YYYY-MM-DD" NY-calendar date (from the
 * outreach:YYYY-MM-DD tag), not a full timestamp — comparing it against
 * Date.now() directly is off by a day for hours after UTC midnight but
 * before NY midnight, so both sides are parsed as plain calendar dates here
 * instead (each at UTC midnight, which cancels out).
 */
export function lastOutreachLabel(date: string | null): string {
  if (!date) return "Never";
  const today = todayNY();
  if (date === today) return "Called today";
  const days = Math.round((new Date(today).getTime() - new Date(date).getTime()) / MS_DAY);
  if (days <= 0) return "Called today";
  return `Called ${days}d ago`;
}

/** "ends in 3d" / "ended 2d ago" for a trial's end date. */
export function trialEndLabel(iso: string | null): string {
  if (!iso) return "";
  const days = daysBetween(iso);
  if (days == null) return "";
  if (days > 0) return `ended ${days}d ago`;
  if (days === 0) return "ends today";
  return `ends in ${-days}d`;
}

/** The date a lead entered its *current* stage — used for the card's "Xd in stage" line. */
export function stageEnteredAt(lead: Lead): string | null {
  switch (lead.stage) {
    case "lead":
      return lead.leadAt;
    case "registered":
      return lead.registeredAt ?? lead.leadAt;
    case "trial":
      return lead.trialStartedAt ?? lead.leadAt;
    case "customer":
      return lead.customerSince ?? lead.leadAt;
    case "churned":
      return lead.churnedAt ?? lead.leadAt;
  }
}

export function daysInStageLabel(lead: Lead): string {
  const days = daysBetween(stageEnteredAt(lead));
  if (days == null) return "—";
  if (days <= 0) return "today";
  return `${days}d in stage`;
}

const MS_HOUR = 60 * 60 * 1000;

/** True when the lead itself (not the stage) was created within the last 48h. */
export function isRecentLead(lead: Lead, now: number = Date.now()): boolean {
  const t = new Date(lead.leadAt).getTime();
  if (Number.isNaN(t)) return false;
  return now - t <= 48 * MS_HOUR;
}

export function todayNY(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

/**
 * Builds an absolute URL from window.location.origin instead of fetching a
 * relative path directly. Aliza's own login is in the URL as Basic Auth
 * (https://user:pass@host/leads), which the browser reflects into
 * window.location.href — a relative-path fetch() inherits that as its base
 * and fails with "Request cannot be constructed from a URL that includes
 * credentials". Resolving against the origin alone sidesteps that.
 */
export function apiUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

const OUTREACH_TAG_RE = /^outreach:(\d{4}-\d{2}-\d{2})$/;

/** Every outreach date on a lead, newest first — the drawer's outreach history. */
export function outreachDates(tags: string[]): string[] {
  return tags
    .map((t) => t.match(OUTREACH_TAG_RE)?.[1])
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse();
}
