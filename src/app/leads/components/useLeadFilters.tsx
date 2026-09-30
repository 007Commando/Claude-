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

export type ViewMode = "board" | "table";
export type LeadDatePreset = "7d" | "14d" | "30d" | "60d" | "90d" | "all" | "custom";
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
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "60d", label: "Last 60 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

const BOARD_SORT_KEYS: BoardSortKey[] = ["newest", "oldest", "az", "lastOutreach"];
const DATE_PRESETS: LeadDatePreset[] = ["7d", "14d", "30d", "60d", "90d", "all", "custom"];

export interface LeadFilters {
  view: ViewMode;
  q: string;
  source: LeadSource[];
  sellerType: SellerType[];
  datePreset: LeadDatePreset;
  from: string;
  to: string;
  ash: boolean;
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

  const view: ViewMode = searchParams.get("view") === "table" ? "table" : "board";
  const source = useMemo(() => searchParams.get("source")?.split(",").filter(Boolean) as LeadSource[] | undefined, [searchParams]) ?? [];
  const sellerType =
    useMemo(() => searchParams.get("sellerType")?.split(",").filter(Boolean) as SellerType[] | undefined, [searchParams]) ?? [];
  const datePresetRaw = searchParams.get("date");
  const datePreset: LeadDatePreset = (DATE_PRESETS as string[]).includes(datePresetRaw ?? "") ? (datePresetRaw as LeadDatePreset) : "all";
  const boardSort = useMemo(() => parseBoardSort(searchParams.get("bsort")), [searchParams]);
  const tableSort = useMemo(() => parseTableSort(searchParams.get("tsort")), [searchParams]);

  return {
    view,
    q: searchParams.get("q") ?? "",
    source,
    sellerType,
    datePreset,
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    ash: searchParams.get("ash") === "1",
    boardSort,
    tableSort,
    activeFilterCount: source.length + sellerType.length + (datePreset !== "all" ? 1 : 0) + (searchParams.get("ash") === "1" ? 1 : 0),
    setView: (v) => setParams({ view: v === "board" ? null : v }),
    setQuery: (q) => setParams({ q: q || null }),
    setSource: (v) => setParams({ source: v }),
    setSellerType: (v) => setParams({ sellerType: v }),
    setDatePreset: (v) => setParams(v === "custom" ? { date: v } : { date: v === "all" ? null : v, from: null, to: null }),
    setCustomRange: (from, to) => setParams({ date: "custom", from: from || null, to: to || null }),
    setAsh: (v) => setParams({ ash: v ? "1" : null }),
    setBoardSort: (stage, key) => setParams({ bsort: encodeBoardSort({ ...boardSort, [stage]: key ?? undefined }) }),
    setTableSort: (sort) => setParams({ tsort: sort ? `${sort.columnId}.${sort.dir}` : null }),
    clearAll: () =>
      setParams({ source: null, sellerType: null, date: null, from: null, to: null, ash: null, q: null }),
  };
}

/** The lead-date window implied by a preset (or custom from/to), as ISO-comparable bounds. */
export function dateWindow(preset: LeadDatePreset, from: string, to: string): { from: string | null; to: string | null } {
  const now = Date.now();
  const MS_DAY = 86_400_000;
  switch (preset) {
    case "all":
      return { from: null, to: null };
    case "7d":
      return { from: new Date(now - 7 * MS_DAY).toISOString(), to: null };
    case "14d":
      return { from: new Date(now - 14 * MS_DAY).toISOString(), to: null };
    case "30d":
      return { from: new Date(now - 30 * MS_DAY).toISOString(), to: null };
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
    if (l.source === "ash" && !f.ash) return false;
    if (f.source.length && !f.source.includes(l.source)) return false;
    if (f.sellerType.length && !f.sellerType.includes(l.sellerType)) return false;
    if (window.from && l.leadAt < window.from) return false;
    if (window.to && l.leadAt > window.to) return false;
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
