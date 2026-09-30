/**
 * Pure helpers for Lead Desk's Funnels view — cohort counting, prorated
 * spend, sales-cycle medians, and the "best customers" leaderboard. Nothing
 * here touches React; see ../../app/leads/components/FunnelView.tsx and its
 * siblings for the UI that calls into this.
 *
 * Cohort rule: a funnel counts leads CREATED in the selected date range
 * (`leadAt` is the only thing checked against the range) and then looks at
 * how far each of those same people has gotten *as of now* — their current
 * `stage`, which model.ts already derives as the furthest stage ever
 * reached (see stageFromTags/stageFromApex + furthestStage). That's what
 * build.ts's own registeredPlus/trialPlus/customerPlus already do for the
 * dashboard totals; this reuses the same rank>=threshold idea so a churned
 * customer still counts as having reached "Paying customer" once.
 */

import type { Lead, LeadSource, SellerType, Stage } from "./model";
import { STAGE_RANK } from "./model";
import spendData from "./spend.json";

const MS_DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Source groupings the funnel cards / leaderboard understand
// ---------------------------------------------------------------------------

export type FunnelSourceKey = "primewell" | "facebook-both" | "facebook-form" | "facebook-web" | "google" | "direct";

export type SpendSourceKey = "primewell" | "facebook";

export interface FunnelSourceOption {
  key: FunnelSourceKey;
  label: string;
  sources: LeadSource[];
  spendKey: SpendSourceKey | null;
  /** Strong colour the funnel's top stage is drawn in. */
  color: string;
  /** Very light tint the funnel's bottom stage fades toward. */
  tint: string;
}

export const FUNNEL_SOURCE_OPTIONS: FunnelSourceOption[] = [
  { key: "primewell", label: "PrimeWell", sources: ["primewell"], spendKey: "primewell", color: "#1d4ed8", tint: "#e8f0fe" },
  {
    key: "facebook-both",
    label: "Facebook (form + web)",
    sources: ["facebook-form", "facebook-web"],
    spendKey: "facebook",
    color: "#5b21b6",
    tint: "#f3eeff",
  },
  { key: "facebook-form", label: "Facebook form", sources: ["facebook-form"], spendKey: "facebook", color: "#5b21b6", tint: "#f3eeff" },
  { key: "facebook-web", label: "Facebook web", sources: ["facebook-web"], spendKey: "facebook", color: "#5b21b6", tint: "#f3eeff" },
  { key: "google", label: "Google", sources: ["google"], spendKey: null, color: "#ea4335", tint: "#fef2f2" },
  { key: "direct", label: "Direct", sources: ["direct"], spendKey: null, color: "#64748b", tint: "#f8fafc" },
];

export const DEFAULT_LEFT_SOURCE: FunnelSourceKey = "primewell";
export const DEFAULT_RIGHT_SOURCE: FunnelSourceKey = "facebook-both";

export function funnelSourceOption(key: FunnelSourceKey): FunnelSourceOption {
  return FUNNEL_SOURCE_OPTIONS.find((o) => o.key === key) ?? FUNNEL_SOURCE_OPTIONS[0];
}

/** A representative single LeadSource for this option's header logo (see SourceLogo). */
export function representativeSource(option: FunnelSourceOption): LeadSource {
  return option.sources[0];
}

// ---------------------------------------------------------------------------
// Cohort + funnel counts
// ---------------------------------------------------------------------------

/**
 * The top-bar filters that make sense for Funnels: lead date range (cohort
 * membership, by `leadAt` alone) and seller type. Search, the source
 * multi-select and the ASH toggle are deliberately not applied here — each
 * card picks its own source, and ASH never is one, so the toggle has no
 * effect on the cards; the leaderboard wants every source, ASH included.
 */
export function applyTopBarFilters(leads: Lead[], sellerType: SellerType[], from: string | null, to: string | null): Lead[] {
  return leads.filter((l) => {
    if (sellerType.length && !sellerType.includes(l.sellerType)) return false;
    if (from && l.leadAt < from) return false;
    if (to && l.leadAt > to) return false;
    return true;
  });
}

export function filterBySourceKey(leads: Lead[], key: FunnelSourceKey): Lead[] {
  const sources = funnelSourceOption(key).sources;
  return leads.filter((l) => sources.includes(l.source));
}

export interface FunnelCounts {
  lead: number;
  registered: number;
  trial: number;
  customer: number;
}

/** How many of `leads` have (ever, as of now) reached each stage's rank. */
export function funnelCounts(leads: Lead[]): FunnelCounts {
  const out: FunnelCounts = { lead: 0, registered: 0, trial: 0, customer: 0 };
  for (const l of leads) {
    const rank = STAGE_RANK[l.stage];
    if (rank >= STAGE_RANK.lead) out.lead += 1;
    if (rank >= STAGE_RANK.registered) out.registered += 1;
    if (rank >= STAGE_RANK.trial) out.trial += 1;
    if (rank >= STAGE_RANK.customer) out.customer += 1;
  }
  return out;
}

export interface FunnelStep {
  key: keyof FunnelCounts;
  label: string;
  stage: Stage;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { key: "lead", label: "Leads", stage: "lead" },
  { key: "registered", label: "Apex account", stage: "registered" },
  { key: "trial", label: "Started trial", stage: "trial" },
  { key: "customer", label: "Paying customer", stage: "customer" },
];

/** Step-over-step conversion %, one entry per boundary (3 entries for 4 steps). Null when the prior step is empty. */
export function stepConversions(counts: FunnelCounts): (number | null)[] {
  const values = [counts.lead, counts.registered, counts.trial, counts.customer];
  const out: (number | null)[] = [];
  for (let i = 1; i < values.length; i++) {
    out.push(values[i - 1] > 0 ? (values[i] / values[i - 1]) * 100 : null);
  }
  return out;
}

export function overallConversionPct(counts: FunnelCounts): number | null {
  return counts.lead > 0 ? (counts.customer / counts.lead) * 100 : null;
}

/**
 * Bar widths (0..1) for the four stages, proportional to their counts
 * relative to the lead count, floored at 0.35 so labels always fit. Flooring
 * with the same constant preserves monotonicity: the raw ratios are already
 * non-increasing (each stage's rank>=X is a subset of rank>=X-1), and
 * max(0.35, x) is monotonic non-decreasing, so the floored sequence stays
 * non-increasing too.
 */
export function stageWidths(counts: FunnelCounts): number[] {
  const base = counts.lead || 1;
  const raw = [counts.lead, counts.registered, counts.trial, counts.customer].map((c) => c / base);
  return raw.map((r) => Math.max(0.35, r));
}

// ---------------------------------------------------------------------------
// Sales cycle (medians)
// ---------------------------------------------------------------------------

function daysBetweenIso(aIso: string, bIso: string): number {
  return (new Date(bIso).getTime() - new Date(aIso).getTime()) / MS_DAY;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export interface CycleStat {
  medianDays: number | null;
  n: number;
}

/** Median days between two of a lead's own dates, skipping leads missing either one. */
export function cycleStat(leads: Lead[], fromField: keyof Lead, toField: keyof Lead): CycleStat {
  const days: number[] = [];
  for (const l of leads) {
    const a = l[fromField] as unknown as string | null;
    const b = l[toField] as unknown as string | null;
    if (!a || !b) continue;
    const d = daysBetweenIso(a, b);
    // A negative span means the later stage predates the lead record (e.g. a
    // customer added to GHL after paying), so it says nothing about the cycle.
    if (d < 0) continue;
    days.push(d);
  }
  return { medianDays: median(days), n: days.length };
}

export interface SalesCycle {
  leadToAccount: CycleStat;
  accountToTrial: CycleStat;
  trialToPaid: CycleStat;
  leadToPaid: CycleStat;
}

export function salesCycle(leads: Lead[]): SalesCycle {
  return {
    leadToAccount: cycleStat(leads, "leadAt", "registeredAt"),
    accountToTrial: cycleStat(leads, "registeredAt", "trialStartedAt"),
    trialToPaid: cycleStat(leads, "trialStartedAt", "customerSince"),
    leadToPaid: cycleStat(leads, "leadAt", "customerSince"),
  };
}

// ---------------------------------------------------------------------------
// Revenue
// ---------------------------------------------------------------------------

export interface RevenueStat {
  totalMrr: number;
  payingCount: number;
  avgMrr: number | null;
}

/**
 * Paying customers' MRR. Uses mrr > 0 rather than stage === "customer" (or
 * rank >= customer, which would also fold in churned leads): a churned lead
 * always carries mrr 0 in this model (stageFromApex's churned branch never
 * sets it), so including them wouldn't move the sum but would understate the
 * average by inflating the denominator with $0 "customers".
 */
export function revenueStat(leads: Lead[]): RevenueStat {
  const paying = leads.filter((l) => l.mrr > 0);
  const totalMrr = paying.reduce((sum, l) => sum + l.mrr, 0);
  return { totalMrr, payingCount: paying.length, avgMrr: paying.length > 0 ? totalMrr / paying.length : null };
}

// ---------------------------------------------------------------------------
// Spend (prorated by day across calendar months)
// ---------------------------------------------------------------------------

export interface SpendMonth {
  primewell: number | null;
  facebook: number | null;
}

export interface SpendFile {
  updated: string;
  note: string;
  months: Record<string, SpendMonth>;
}

export const SPEND = spendData as SpendFile;

function toDayIndex(d: Date): number {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / MS_DAY);
}

function daysInMonth(year: number, month0: number): number {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

interface MonthOverlap {
  key: string;
  overlapDays: number;
  totalDays: number;
}

/** Every calendar month touched by [start, end], with how many of that month's days fall inside the range (inclusive on both ends). */
function monthsBetween(start: Date, end: Date): MonthOverlap[] {
  const startDay = toDayIndex(start);
  const endDay = toDayIndex(end);
  if (startDay > endDay) return [];
  const out: MonthOverlap[] = [];
  let year = start.getUTCFullYear();
  let month0 = start.getUTCMonth();
  for (;;) {
    const total = daysInMonth(year, month0);
    const monthStartDay = toDayIndex(new Date(Date.UTC(year, month0, 1)));
    const monthEndDay = monthStartDay + total - 1;
    if (monthStartDay > endDay) break;
    const overlapStartDay = Math.max(startDay, monthStartDay);
    const overlapEndDay = Math.min(endDay, monthEndDay);
    const overlapDays = Math.max(0, overlapEndDay - overlapStartDay + 1);
    out.push({ key: `${year}-${String(month0 + 1).padStart(2, "0")}`, overlapDays, totalDays: total });
    month0 += 1;
    if (month0 > 11) {
      month0 = 0;
      year += 1;
    }
  }
  return out;
}

/**
 * Sums a source's spend across [start, end], prorating each touched month by
 * the fraction of its days inside the range. Returns null (never a
 * misleading number) the moment any touched month is missing from the file
 * or has that key set to null — including months before spend.json's
 * earliest entry, which honestly means "we don't know", not "$0".
 */
export function proratedSpendForKey(spendFile: SpendFile, key: SpendSourceKey, start: Date, end: Date): number | null {
  const months = monthsBetween(start, end);
  if (months.length === 0) return 0;
  let total = 0;
  for (const m of months) {
    const entry = spendFile.months[m.key];
    const value = entry ? entry[key] : undefined;
    if (value == null) return null;
    total += (value * m.overlapDays) / m.totalDays;
  }
  return total;
}

/**
 * The [start, end] Date bounds implied by a lead-date window. `to` defaults
 * to now when unbounded. `from` defaults to the cohort's own earliest
 * `leadAt` (the "all time" preset never sets `from`) — spend from before
 * spend.json's first recorded month then correctly comes back "not
 * recorded" rather than silently skipped.
 */
export function resolveSpendRange(from: string | null, to: string | null, cohort: Lead[]): { start: Date; end: Date } {
  const end = to ? new Date(to) : new Date();
  if (from) return { start: new Date(from), end };
  let earliest: string | null = null;
  for (const l of cohort) {
    if (earliest == null || l.leadAt < earliest) earliest = l.leadAt;
  }
  return { start: earliest ? new Date(earliest) : end, end };
}

/** Facebook spend is tracked as one combined number; split it by lead-count share when a card shows only form or only web. 1 for every other option. */
export function facebookSplitFraction(option: FunnelSourceOption, cohortAllSources: Lead[]): number {
  if (option.key !== "facebook-form" && option.key !== "facebook-web") return 1;
  const formCount = cohortAllSources.filter((l) => l.source === "facebook-form").length;
  const webCount = cohortAllSources.filter((l) => l.source === "facebook-web").length;
  const total = formCount + webCount;
  if (total === 0) return 0;
  return option.key === "facebook-form" ? formCount / total : webCount / total;
}

export interface CostBreakdown {
  recorded: boolean;
  perLead: number | null;
  perAccount: number | null;
  perTrial: number | null;
  perCustomer: number | null;
}

const NOT_RECORDED: CostBreakdown = { recorded: false, perLead: null, perAccount: null, perTrial: null, perCustomer: null };

export function costBreakdown(
  option: FunnelSourceOption,
  counts: FunnelCounts,
  spendFile: SpendFile,
  start: Date,
  end: Date,
  fbSplitFraction: number,
): CostBreakdown {
  if (!option.spendKey) return NOT_RECORDED;
  const raw = proratedSpendForKey(spendFile, option.spendKey, start, end);
  if (raw == null) return NOT_RECORDED;
  const spend = option.spendKey === "facebook" ? raw * fbSplitFraction : raw;
  const per = (count: number) => (count > 0 ? spend / count : null);
  return { recorded: true, perLead: per(counts.lead), perAccount: per(counts.registered), perTrial: per(counts.trial), perCustomer: per(counts.customer) };
}

// ---------------------------------------------------------------------------
// "Where the best customers came from" leaderboard — every source, not just
// the two the cards show.
// ---------------------------------------------------------------------------

export const ALL_LEAD_SOURCES: LeadSource[] = ["primewell", "facebook-form", "facebook-web", "google", "chatgpt", "ash", "direct", "other"];

export interface LeaderboardRow {
  source: LeadSource;
  leads: number;
  customers: number;
  leadToPaidPct: number | null;
  mrr: number;
  avgMrr: number | null;
  medianDaysToPaid: CycleStat;
  costPerCustomer: number | null;
  spendRecorded: boolean;
}

export function sourceLeaderboard(cohort: Lead[], spendFile: SpendFile, start: Date, end: Date): LeaderboardRow[] {
  const formCount = cohort.filter((l) => l.source === "facebook-form").length;
  const webCount = cohort.filter((l) => l.source === "facebook-web").length;
  const fbTotal = formCount + webCount;

  const rows: LeaderboardRow[] = [];
  for (const source of ALL_LEAD_SOURCES) {
    const leads = cohort.filter((l) => l.source === source);
    if (leads.length === 0) continue;
    const counts = funnelCounts(leads);
    const rev = revenueStat(leads);
    const cycle = cycleStat(leads, "leadAt", "customerSince");

    let costPerCustomer: number | null = null;
    let spendRecorded = false;
    if (source === "primewell") {
      const raw = proratedSpendForKey(spendFile, "primewell", start, end);
      spendRecorded = raw != null;
      costPerCustomer = raw != null && counts.customer > 0 ? raw / counts.customer : null;
    } else if (source === "facebook-form" || source === "facebook-web") {
      const raw = proratedSpendForKey(spendFile, "facebook", start, end);
      spendRecorded = raw != null;
      if (raw != null && fbTotal > 0) {
        const fraction = source === "facebook-form" ? formCount / fbTotal : webCount / fbTotal;
        const spend = raw * fraction;
        costPerCustomer = counts.customer > 0 ? spend / counts.customer : null;
      }
    }

    rows.push({
      source,
      leads: leads.length,
      customers: counts.customer,
      leadToPaidPct: overallConversionPct(counts),
      mrr: rev.totalMrr,
      avgMrr: rev.avgMrr,
      medianDaysToPaid: cycle,
      costPerCustomer,
      spendRecorded,
    });
  }

  return rows.sort((a, b) => b.customers - a.customers);
}
