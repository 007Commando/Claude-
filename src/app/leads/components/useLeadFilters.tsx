"use client";

/**
 * URL-backed state for Lead Desk: view, search, toolbar filters, and both
 * views' sort. Everything here round-trips through the query string so a
 * view can be bookmarked and handed to Aliza — see the module doc in
 * LeadDesk.tsx. Column layout (order/visibility/widths) is the one piece of
 * state that lives in localStorage instead; that's owned by LeadTable/Board.
 */

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Lead, LeadSource, SellerType, Stage } from "../../../lib/leads/model";

export type ViewMode = "board" | "table" | "funnels" | "live" | "ads";
export type LeadDatePreset = "today" | "7d" | "14d" | "30d" | "45d" | "60d" | "90d" | "all" | "custom";
export type BoardSortKey = "newest" | "oldest" | "az" | "lastOutreach";
export type SortDir = "asc" | "desc";

export interface TableSort {
  columnId: string;
  dir: SortDir;
}

export const BOARD_SORT_OPTIONS: { value: BoardSortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A to Z" },
  { value: "lastOutreach", label: "Last outreach" },
];

export const DATE_PRESET_OPTIONS: { value: LeadDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "45d", label: "Last 45 days" },
  { value: "60d", label: "Last 60 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

const BOARD_SORT_KEYS: BoardSortKey[] = ["newest", "oldest", "az", "lastOutreach"];
export type DateScope = "new" | "activity";
const DATE_PRESETS: LeadDatePreset[] = ["today", "7d", "14d", "30d", "45d", "60d", "90d", "all", "custom"];

export interface LeadFilters {
  view: ViewMode;
  q: string;
  source: LeadSource[];
  sellerType: SellerType[];
  datePreset: LeadDatePreset;
  from: string;
  to: string;
  ash: boolean;
  /**
   * What a date range means (Stefano, 2026-10-08). "new": only the leads that came in during the range,
   * so every column counts that same group and First scan can never exceed the leads it came from.
   * "activity": anyone who did something in the range, plus everyone trialing or paying now.
   */
  scope: DateScope;
  /** Single-stage filter, set by clicking a Funnels stage — see goToStageInTable. Not shown as a top-bar control. */
  stage: Stage | null;
  boardSort: Partial<Record<Stage, BoardSortKey>>;
  tableSort: TableSort | null;
  activeFilterCount: number;
  setView: (v: ViewMode) => void;
  setQuery: (q: string) => void;
  setSource: (v: LeadSource[]) => void;
  setSellerType: (v: SellerType[]) => void;
  setDatePreset: (v: LeadDatePreset) => void;
  setCustomRange: (from: string, to: string) => void;
  setAsh: (v: boolean) => void;
  setScope: (v: DateScope) => void;
  setStage: (v: Stage | null) => void;
  /** Jumps to the Table view pre-filtered to one source group and one stage — used by a Funnels stage click. One combined URL update so the three params land together instead of stomping each other. */
  goToStageInTable: (sources: LeadSource[], stage: Stage) => void;
  setBoardSort: (stage: Stage, key: BoardSortKey | null) => void;
  setTableSort: (sort: TableSort | null) => void;
  clearAll: () => void;
}

function parseBoardSort(raw: string | null): Partial<Record<Stage, BoardSortKey>> {
  if (!raw) return {};
  const out: Partial<Record<Stage, BoardSortKey>> = {};
  for (const part of raw.split(",")) {
    const [stage, key] = part.split(".");
    if (!stage || !key) continue;
    if ((STAGES as string[]).includes(stage) && (BOARD_SORT_KEYS as string[]).includes(key)) {
      out[stage as Stage] = key as BoardSortKey;
    }
  }
  return out;
}

function encodeBoardSort(sort: Partial<Record<Stage, BoardSortKey>>): string | null {
  const parts = Object.entries(sort)
    .filter((entry): entry is [string, BoardSortKey] => Boolean(entry[1]))
    .map(([stage, key]) => `${stage}.${key}`);
  return parts.length ? parts.join(",") : null;
}

function parseTableSort(raw: string | null): TableSort | null {
  if (!raw) return null;
  const [columnId, dir] = raw.split(".");
  if (!columnId || (dir !== "asc" && dir !== "desc")) return null;
  return { columnId, dir };
}

const STAGES: Stage[] = ["lead", "registered", "trial", "customer", "churned"];

export function useLeadFilters(): LeadFilters {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();

  const setParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchString);
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value.length === 0) {
          params.delete(key);
        } else {
          params.set(key, Array.isArray(value) ? value.join(",") : value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchString],
  );

  const viewParam = searchParams.get("view");
  const view: ViewMode =
    viewParam === "table" ? "table" : viewParam === "funnels" ? "funnels" : viewParam === "live" ? "live" : viewParam === "ads" || viewParam === "experiments" ? "ads" : "board";
  const source = useMemo(() => searchParams.get("source")?.split(",").filter(Boolean) as LeadSource[] | undefined, [searchParams]) ?? [];
  const sellerType =
    useMemo(() => searchParams.get("sellerType")?.split(",").filter(Boolean) as SellerType[] | undefined, [searchParams]) ?? [];
  const datePresetRaw = searchParams.get("date");
  // Opening the desk lands on today (Stefano, 2026-10-08); "all" now has to be asked for in the URL.
  const datePreset: LeadDatePreset = (DATE_PRESETS as string[]).includes(datePresetRaw ?? "") ? (datePresetRaw as LeadDatePreset) : DEFAULT_DATE_PRESET;
  const boardSort = useMemo(() => parseBoardSort(searchParams.get("bsort")), [searchParams]);
  const tableSort = useMemo(() => parseTableSort(searchParams.get("tsort")), [searchParams]);
  const stageParam = searchParams.get("stage");
  const stage: Stage | null = (STAGES as string[]).includes(stageParam ?? "") ? (stageParam as Stage) : null;

  return {
    view,
    q: searchParams.get("q") ?? "",
    source,
    sellerType,
    datePreset,
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    ash: searchParams.get("ash") === "1",
    scope: searchParams.get("scope") === "activity" ? "activity" : "new",
    stage,
    boardSort,
    tableSort,
    activeFilterCount:
      source.length + sellerType.length + (datePreset !== DEFAULT_DATE_PRESET ? 1 : 0) + (searchParams.get("ash") === "1" ? 1 : 0) + (stage ? 1 : 0),
    setView: (v) => setParams({ view: v === "board" ? null : v, stage: v === "table" ? stage : null }),
    setQuery: (q) => setParams({ q: q || null }),
    setSource: (v) => setParams({ source: v }),
    setSellerType: (v) => setParams({ sellerType: v }),
    setDatePreset: (v) => setParams(v === "custom" ? { date: v } : { date: v === DEFAULT_DATE_PRESET ? null : v, from: null, to: null }),
    setCustomRange: (from, to) => setParams({ date: "custom", from: from || null, to: to || null }),
    setAsh: (v) => setParams({ ash: v ? "1" : null }),
    setScope: (v) => setParams({ scope: v === "activity" ? "activity" : null }),
    setStage: (v) => setParams({ stage: v }),
    goToStageInTable: (sources, targetStage) => setParams({ view: "table", source: sources, stage: targetStage }),
    setBoardSort: (stage, key) => setParams({ bsort: encodeBoardSort({ ...boardSort, [stage]: key ?? undefined }) }),
    setTableSort: (sort) => setParams({ tsort: sort ? `${sort.columnId}.${sort.dir}` : null }),
    clearAll: () =>
      setParams({ source: null, sellerType: null, date: null, from: null, to: null, ash: null, q: null, stage: null, scope: null }),
  };
}

export const DEFAULT_DATE_PRESET: LeadDatePreset = "today";

/** Midnight at the start of the viewer's day, as an ISO string. */
export function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Trialing and paying are states, not events: every range shows everyone currently in them. */
export function isLiveStage(stage: Stage): boolean {
  return stage === "trial" || stage === "customer";
}

function activityDates(l: Lead): (string | null)[] {
  return [l.leadAt, l.registeredAt, l.trialStartedAt, l.customerSince, l.churnedAt, l.activation.firstScanAt, l.activation.amazonConnectedAt];
}

/** The lead-date window implied by a preset (or custom from/to), as ISO-comparable bounds. */
export function dateWindow(preset: LeadDatePreset, from: string, to: string): { from: string | null; to: string | null } {
  const now = Date.now();
  const MS_DAY = 86_400_000;
  switch (preset) {
    case "today":
      return { from: todayStartIso(), to: null };
    case "all":
      return { from: null, to: null };
    case "7d":
      return { from: new Date(now - 7 * MS_DAY).toISOString(), to: null };
    case "14d":
      return { from: new Date(now - 14 * MS_DAY).toISOString(), to: null };
    case "30d":
      return { from: new Date(now - 30 * MS_DAY).toISOString(), to: null };
    case "45d":
      return { from: new Date(now - 45 * MS_DAY).toISOString(), to: null };
    case "60d":
      return { from: new Date(now - 60 * MS_DAY).toISOString(), to: null };
    case "90d":
      return { from: new Date(now - 90 * MS_DAY).toISOString(), to: null };
    case "custom":
      return { from: from || null, to: to ? `${to}T23:59:59.999` : null };
  }
}

export function filterLeads(leads: Lead[], f: LeadFilters): Lead[] {
  const q = f.q.trim().toLowerCase();
  const window = dateWindow(f.datePreset, f.from, f.to);
  return leads.filter((l) => {
    // Our own accounts never show. Webinar imports hide only while they are
    // plain leads: once one makes an account, trials or pays, it is a real
    // conversion and belongs on the board (2026-10-07: two trials and three
    // paying customers were hidden by this toggle).
    if (l.internal) return false;
    if (l.source === "ash" && l.stage === "lead" && !f.ash) return false;
    if (f.source.length && !f.source.includes(l.source)) return false;
    if (f.sellerType.length && !f.sellerType.includes(l.sellerType)) return false;
    // The single-stage filter only means something in the Table; the Board is split by stage already.
    if (f.stage && f.view === "table" && l.stage !== f.stage) return false;
    const inWindow = (d: string | null | undefined) => Boolean(d) && (!window.from || (d as string) >= window.from) && (!window.to || (d as string) <= window.to);
    if ((window.from || window.to) && f.scope === "new") {
      // A cohort: only leads that came in during the range, at whatever stage they have reached since.
      // Except everyone trialing or paying right now, who always shows: they are the people being worked to
      // close, and a trial whose lead dates from August was disappearing from Today (Nicholas Mondell, 2026-10-08).
      if (!isLiveStage(l.stage) && !inWindow(l.leadAt)) return false;
    } else if ((window.from || window.to) && !isLiveStage(l.stage)) {
      // "activity": anyone who did something in the range, plus everyone trialing or paying now:
      // a PrimeWell lead from August who started a trial this week must show (2026-10-08, gambitgoods).
      const dates = activityDates(l);
      const inside = dates.some((d) => d && (!window.from || d >= window.from) && (!window.to || d <= window.to));
      if (!inside) return false;
    }
    if (q) {
      const hay = `${l.name} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

const DATE_FIELD: Record<Stage, keyof Lead> = {
  lead: "leadAt",
  registered: "registeredAt",
  trial: "trialStartedAt",
  customer: "customerSince",
  churned: "churnedAt",
};

/** Every column runs newest to oldest by its own stage date (Stefano, 2026-09-29). */
const DEFAULT_BOARD_SORT: Record<Stage, BoardSortKey> = {
  lead: "newest",
  registered: "newest",
  trial: "newest",
  customer: "newest",
  churned: "newest",
};

function sortByDateField(leads: Lead[], field: keyof Lead, dir: 1 | -1): Lead[] {
  return [...leads].sort((a, b) => {
    const av = (a[field] as string | null) ?? null;
    const bv = (b[field] as string | null) ?? null;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
  });
}

/**
 * Orders one board column's cards. With no explicit `key` (the column's menu
 * hasn't been touched) every column is newest to oldest by its own stage
 * date; the column's sort menu overrides that.
 */
export function sortBoardColumn(leads: Lead[], stage: Stage, key: BoardSortKey | undefined): Lead[] {
  const effective = key ?? DEFAULT_BOARD_SORT[stage];

  let sorted: Lead[];
  if (effective === "az") {
    sorted = [...leads].sort((a, b) => a.name.localeCompare(b.name));
  } else if (effective === "lastOutreach") {
    // Never-contacted first, then longest-overdue to most-recent — the order
    // that actually surfaces who needs a call.
    sorted = sortByDateField(leads, "lastOutreachAt", 1);
  } else {
    sorted = sortByDateField(leads, DATE_FIELD[stage], effective === "newest" ? -1 : 1);
  }

  return sorted;
}
