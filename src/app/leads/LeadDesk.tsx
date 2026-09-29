"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Filter,
  Phone,
  RefreshCw,
  X,
} from "lucide-react";
import { STAGE_RANK, type Lead, type LeadSource, type SellerType, type Stage } from "../../lib/leads/model";
import type { LeadsTotals } from "../../lib/leads/build";
import { downloadCsv } from "../../lib/dashboard/csv";
import demographics from "../../lib/leads/facebookDemographics.json";

interface LeadsResponse {
  generatedAt: string;
  leads: Lead[];
  totals: LeadsTotals;
  warnings: string[];
  loggedInAs: string | null;
  goalTrials: number;
  /** "YYYY-MM" — the month the goal tracker counts against, not necessarily the current one. */
  goalMonth: string;
}

const MS_DAY = 86_400_000;

const SOURCE_LABELS: Record<LeadSource, string> = {
  primewell: "PrimeWell",
  "facebook-form": "Facebook form",
  "facebook-web": "Facebook web",
  google: "Google",
  chatgpt: "ChatGPT",
  ash: "Amazon Success Hub",
  direct: "Direct",
  other: "Other",
};

const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  registered: "Registered",
  trial: "Trial",
  customer: "Customer",
  churned: "Churned",
};

const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  selling: "Selling",
  beginner: "Beginner",
  unknown: "Unknown",
};

// "ash" is deliberately left out of the selectable Source filter — Amazon
// Success Hub contacts are hidden by default and brought back with their own
// dedicated checkbox instead (see the "ash" filter param).
const ALL_SOURCES: LeadSource[] = ["primewell", "facebook-form", "facebook-web", "google", "chatgpt", "direct", "other"];
const ALL_STAGES: Stage[] = ["lead", "registered", "trial", "customer", "churned"];
const ALL_SELLER_TYPES: SellerType[] = ["selling", "beginner", "unknown"];

const SOURCE_TONE: Record<LeadSource, BadgeTone> = {
  primewell: "purple",
  "facebook-form": "blue",
  "facebook-web": "blue",
  google: "amber",
  chatgpt: "green",
  ash: "slate",
  direct: "slate",
  other: "slate",
};

const STAGE_TONE: Record<Stage, BadgeTone> = {
  lead: "slate",
  registered: "blue",
  trial: "amber",
  customer: "green",
  churned: "red",
};

type BadgeTone = "green" | "slate" | "red" | "amber" | "blue" | "purple";

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  const toneClasses: Record<BadgeTone, string> = {
    green: "bg-green-50 text-green-700 border-green-200",
    slate: "bg-slate-50 text-slate-500 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

const SourceBadge = ({ source }: { source: LeadSource }) => <Badge tone={SOURCE_TONE[source]}>{SOURCE_LABELS[source]}</Badge>;
const StageBadge = ({ stage }: { stage: Stage }) => <Badge tone={STAGE_TONE[stage]}>{STAGE_LABELS[stage]}</Badge>;

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function todayNY(): string {
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
function apiUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

// ---------------------------------------------------------------------------
// Queues
// ---------------------------------------------------------------------------

interface Queues {
  q1: Lead[];
  q2: Lead[];
  q3: Lead[];
  q4: Lead[];
  q5: Lead[];
}

function computeQueues(leads: Lead[]): Queues {
  const now = Date.now();
  const today = todayNY();

  const q1 = leads
    .filter((l) => l.stage === "registered" && l.lastOutreachAt !== today)
    .sort((a, b) => {
      const aPw = a.source === "primewell" ? 0 : 1;
      const bPw = b.source === "primewell" ? 0 : 1;
      if (aPw !== bPw) return aPw - bPw;
      return b.leadAt.localeCompare(a.leadAt);
    });

  const q2 = leads.filter((l) => l.source === "primewell" && l.stage === "lead").sort((a, b) => b.leadAt.localeCompare(a.leadAt));

  const q3 = leads
    .filter((l) => {
      if (l.stage !== "trial" || !l.trialEndsAt) return false;
      const msUntil = new Date(l.trialEndsAt).getTime() - now;
      return msUntil >= 0 && msUntil <= 3 * MS_DAY;
    })
    .sort((a, b) => (a.trialEndsAt ?? "").localeCompare(b.trialEndsAt ?? ""));

  const q4 = leads
    .filter((l) => {
      if (l.stage !== "lead" || l.source === "primewell" || l.outreachCount > 0) return false;
      return now - new Date(l.leadAt).getTime() <= 2 * MS_DAY;
    })
    .sort((a, b) => b.leadAt.localeCompare(a.leadAt));

  const q5 = leads
    .filter((l) => {
      if (l.outreachCount < 1 || !l.lastOutreachAt) return false;
      if (l.stage !== "lead" && l.stage !== "registered") return false;
      return now - new Date(l.lastOutreachAt).getTime() >= 3 * MS_DAY;
    })
    .sort((a, b) => (a.lastOutreachAt ?? "").localeCompare(b.lastOutreachAt ?? ""));

  return { q1, q2, q3, q4, q5 };
}

function LeadNameCell({ lead }: { lead: Lead }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {lead.ghlUrl ? (
          <a
            href={lead.ghlUrl}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-slate-900 hover:text-brand hover:underline inline-flex items-center gap-1"
          >
            {lead.name}
            <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />
          </a>
        ) : (
          <span className="font-bold text-slate-900">{lead.name}</span>
        )}
        {lead.registeredAt && <Badge tone="blue">Apex</Badge>}
      </div>
      <div className="text-xs text-slate-400">{lead.email ?? lead.phone ?? "—"}</div>
    </div>
  );
}

function MarkContactedButton({
  lead,
  pending,
  onClick,
  fullWidth,
}: {
  lead: Lead;
  pending: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  const today = todayNY();
  if (lead.lastOutreachAt === today) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold text-green-700 ${fullWidth ? "w-full justify-center" : ""}`}>
        <Check className="w-3.5 h-3.5" /> Contacted {fmtDate(lead.lastOutreachAt)}
      </span>
    );
  }
  if (!lead.ghlContactId) {
    return <span className="text-xs text-slate-300">No GHL contact</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap ${fullWidth ? "w-full justify-center" : ""}`}
    >
      <Phone className="w-3.5 h-3.5" />
      {pending ? "Saving…" : "Mark contacted"}
    </button>
  );
}

function QueueSection({
  title,
  leads,
  dateLabel,
  getDate,
  emptyText,
  onMarkContacted,
  pendingIds,
}: {
  title: string;
  leads: Lead[];
  dateLabel: string;
  getDate: (l: Lead) => string | null;
  emptyText: string;
  onMarkContacted: (l: Lead) => void;
  pendingIds: Set<string>;
}) {
  const [open, setOpen] = useState(true);
  const PAGE_SIZE = 25;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleLeads = leads.slice(0, visibleCount);
  const remaining = leads.length - visibleLeads.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">
            {leads.length}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open &&
        (leads.length === 0 ? (
          <p className="text-sm text-slate-400 mt-3">{emptyText}</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto -mx-2 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Source</th>
                    <th className="px-2 py-2">Phone</th>
                    <th className="px-2 py-2">{dateLabel}</th>
                    <th className="px-2 py-2">Outreach</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-100">
                      <td className="px-2 py-2.5">
                        <LeadNameCell lead={lead} />
                      </td>
                      <td className="px-2 py-2.5">
                        <SourceBadge source={lead.source} />
                      </td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-nowrap">{lead.phone ?? "—"}</td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-nowrap">{fmtDate(getDate(lead))}</td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-nowrap">
                        {lead.outreachCount > 0 ? `${lead.outreachCount}x, last ${fmtDate(lead.lastOutreachAt)}` : "Never"}
                      </td>
                      <td className="px-2 py-2.5">
                        <MarkContactedButton lead={lead} pending={pendingIds.has(lead.id)} onClick={() => onMarkContacted(lead)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden mt-3 space-y-3">
              {visibleLeads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <LeadNameCell lead={lead} />
                    <SourceBadge source={lead.source} />
                  </div>
                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    <div>
                      {dateLabel}: {fmtDate(getDate(lead))}
                    </div>
                    <div>Phone: {lead.phone ?? "—"}</div>
                    <div>Outreach: {lead.outreachCount > 0 ? `${lead.outreachCount}x, last ${fmtDate(lead.lastOutreachAt)}` : "Never"}</div>
                  </div>
                  <div className="mt-3">
                    <MarkContactedButton lead={lead} pending={pendingIds.has(lead.id)} onClick={() => onMarkContacted(lead)} fullWidth />
                  </div>
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="mt-4 w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Show {Math.min(PAGE_SIZE, remaining)} more ({remaining} left)
              </button>
            )}
          </>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Goal tracker
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

/** Parses "YYYY-MM" into a { year, month } pair (month is 0-indexed, for the Date constructor). Falls back to the current month on a malformed value. */
function parseGoalMonth(goalMonth: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(goalMonth);
  if (!match) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

function computeGoal(leads: Lead[], goal: number, goalMonth: string) {
  const { year, month } = parseGoalMonth(goalMonth);
  const monthStart = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const hasStarted = now >= monthStart;

  if (!hasStarted) {
    return {
      trialsStartedThisMonth: 0,
      customersThisMonth: 0,
      achieved: 0,
      daysLeft: daysInMonth,
      runRate: goal / daysInMonth,
      hasStarted: false,
      monthStart,
    };
  }

  const inThisMonth = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === year && d.getMonth() === month;
  };
  const trialsStartedThisMonth = leads.filter((l) => inThisMonth(l.trialStartedAt)).length;
  const customersThisMonth = leads.filter((l) => inThisMonth(l.customerSince)).length;
  // A trial that also converted this month is one person, not two — the
  // progress bar counts them once toward the goal even though both stats
  // above are shown separately for context.
  const achieved = leads.filter((l) => inThisMonth(l.trialStartedAt) || inThisMonth(l.customerSince)).length;
  const monthEnd = new Date(year, month + 1, 0);
  const today = now > monthEnd ? monthEnd : now;
  const daysLeft = Math.max(0, daysInMonth - today.getDate() + 1);
  const remaining = Math.max(0, goal - achieved);
  const runRate = daysLeft > 0 ? remaining / daysLeft : remaining;
  return { trialsStartedThisMonth, customersThisMonth, achieved, daysLeft, runRate, hasStarted: true, monthStart };
}

function GoalTrackerCard({ leads, goal, goalMonth }: { leads: Lead[]; goal: number; goalMonth: string }) {
  const stats = useMemo(() => computeGoal(leads, goal, goalMonth), [leads, goal, goalMonth]);
  const pct = goal > 0 ? Math.min(100, Math.round((stats.achieved / goal) * 100)) : 0;
  const monthName = stats.monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{monthName} Goal</h2>
        <span className="text-xs font-bold text-slate-500">
          {stats.achieved} / {goal}
        </span>
      </div>
      {!stats.hasStarted && (
        <p className="text-xs text-slate-400 mb-3">
          Starts {stats.monthStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
      )}
      <div className={`w-full h-3 rounded-full bg-slate-100 overflow-hidden mb-5 ${stats.hasStarted ? "" : "mt-3"}`}>
        <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Trials started" value={stats.trialsStartedThisMonth} />
        <Stat label="New customers" value={stats.customersThisMonth} />
        <Stat label="Days left" value={stats.daysLeft} />
        <Stat label="Needed per day" value={stats.runRate.toFixed(1)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// All leads: filters (in the URL) + table
// ---------------------------------------------------------------------------

interface LeadFilters {
  source: string[];
  stage: string[];
  sellerType: string[];
  from: string;
  to: string;
  q: string;
  outreach: string;
  tag: string;
  /** Amazon Success Hub webinar contacts are hidden unless this is true (URL param ash=1). */
  ash: boolean;
  setParams: (updates: Record<string, string | string[] | null>) => void;
}

function useLeadFilters(): LeadFilters {
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

  return {
    source: searchParams.get("source")?.split(",").filter(Boolean) ?? [],
    stage: searchParams.get("stage")?.split(",").filter(Boolean) ?? [],
    sellerType: searchParams.get("sellerType")?.split(",").filter(Boolean) ?? [],
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    q: searchParams.get("q") ?? "",
    outreach: searchParams.get("outreach") ?? "",
    tag: searchParams.get("tag") ?? "",
    ash: searchParams.get("ash") === "1",
    setParams,
  };
}

function applyFilters(leads: Lead[], f: LeadFilters): Lead[] {
  const q = f.q.trim().toLowerCase();
  const tag = f.tag.trim().toLowerCase();
  return leads.filter((l) => {
    if (l.source === "ash" && !f.ash) return false;
    if (f.source.length && !f.source.includes(l.source)) return false;
    if (f.stage.length && !f.stage.includes(l.stage)) return false;
    if (f.sellerType.length && !f.sellerType.includes(l.sellerType)) return false;
    if (f.from && l.leadAt < f.from) return false;
    if (f.to && l.leadAt > `${f.to}T23:59:59`) return false;
    if (f.outreach === "yes" && l.outreachCount === 0) return false;
    if (f.outreach === "no" && l.outreachCount > 0) return false;
    if (tag && !l.tags.some((t) => t.toLowerCase().includes(tag))) return false;
    if (q) {
      const hay = `${l.name} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

type SortKey =
  | "leadAt"
  | "name"
  | "source"
  | "sellerType"
  | "stage"
  | "registeredAt"
  | "trialStartedAt"
  | "customerSince"
  | "planName"
  | "lastOutreachAt";

function sortLeads(leads: Lead[], key: SortKey, dir: "asc" | "desc"): Lead[] {
  const factor = dir === "asc" ? 1 : -1;
  const val = (l: Lead): string | number => {
    switch (key) {
      case "leadAt":
        return l.leadAt;
      case "name":
        return l.name.toLowerCase();
      case "source":
        return l.source;
      case "sellerType":
        return l.sellerType;
      case "stage":
        return STAGE_RANK[l.stage];
      case "registeredAt":
        return l.registeredAt ?? "";
      case "trialStartedAt":
        return l.trialStartedAt ?? "";
      case "customerSince":
        return l.customerSince ?? "";
      case "planName":
        return l.planName ?? "";
      case "lastOutreachAt":
        return l.lastOutreachAt ?? "";
    }
  };
  return [...leads].sort((a, b) => {
    const av = val(a);
    const bv = val(b);
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</div>
      <div className="space-y-1">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="rounded border-slate-300 text-brand focus:ring-brand"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th className="px-2 py-2 cursor-pointer select-none whitespace-nowrap" onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
    </th>
  );
}

function exportLeadsCsv(leads: Lead[]) {
  downloadCsv(
    `leads-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "Lead Date",
      "Name",
      "Email",
      "Phone",
      "Source",
      "Source Detail",
      "Seller Type",
      "Stage",
      "Registered",
      "Trial Started",
      "Trial Ends",
      "Customer Since",
      "Churned",
      "Plan",
      "MRR",
      "Last Outreach",
      "Outreach Count",
      "Tags",
      "GHL URL",
    ],
    leads.map((l) => [
      l.leadAt,
      l.name,
      l.email ?? "",
      l.phone ?? "",
      SOURCE_LABELS[l.source],
      l.sourceDetail ?? "",
      SELLER_TYPE_LABELS[l.sellerType],
      STAGE_LABELS[l.stage],
      l.registeredAt ?? "",
      l.trialStartedAt ?? "",
      l.trialEndsAt ?? "",
      l.customerSince ?? "",
      l.churnedAt ?? "",
      l.planName ?? "",
      l.mrr.toFixed(2),
      l.lastOutreachAt ?? "",
      String(l.outreachCount),
      l.tags.join("; "),
      l.ghlUrl ?? "",
    ]),
  );
}

function AllLeadsSection({
  filters,
  filteredLeads,
  sortKey,
  sortDir,
  onSort,
}: {
  filters: LeadFilters;
  filteredLeads: Lead[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount =
    filters.source.length +
    filters.stage.length +
    filters.sellerType.length +
    (filters.from ? 1 : 0) +
    (filters.to ? 1 : 0) +
    (filters.tag ? 1 : 0) +
    (filters.outreach ? 1 : 0) +
    (filters.ash ? 1 : 0);

  const clearAll = () =>
    filters.setParams({
      source: null,
      stage: null,
      sellerType: null,
      from: null,
      to: null,
      tag: null,
      outreach: null,
      q: null,
      ash: null,
    });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">All Leads ({filteredLeads.length})</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportLeadsCsv(filteredLeads)}
            disabled={filteredLeads.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-brand text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={filters.q}
          onChange={(e) => filters.setParams({ q: e.target.value || null })}
          placeholder="Search name, email, phone…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        {filters.q && (
          <button type="button" onClick={() => filters.setParams({ q: null })} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CheckboxGroup
              label="Source"
              options={ALL_SOURCES.map((s) => ({ value: s, label: SOURCE_LABELS[s] }))}
              selected={filters.source}
              onChange={(v) => filters.setParams({ source: v })}
            />
            <CheckboxGroup
              label="Stage"
              options={ALL_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))}
              selected={filters.stage}
              onChange={(v) => filters.setParams({ stage: v })}
            />
            <CheckboxGroup
              label="Seller type"
              options={ALL_SELLER_TYPES.map((s) => ({ value: s, label: SELLER_TYPE_LABELS[s] }))}
              selected={filters.sellerType}
              onChange={(v) => filters.setParams({ sellerType: v })}
            />
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Lead date</div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => filters.setParams({ from: e.target.value || null })}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => filters.setParams({ to: e.target.value || null })}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tag contains</div>
                <input
                  type="text"
                  value={filters.tag}
                  onChange={(e) => filters.setParams({ tag: e.target.value || null })}
                  placeholder="e.g. stage:trial"
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Outreach</div>
                <select
                  value={filters.outreach}
                  onChange={(e) => filters.setParams({ outreach: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                >
                  <option value="">Any</option>
                  <option value="yes">Has outreach</option>
                  <option value="no">No outreach</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.ash}
                  onChange={(e) => filters.setParams({ ash: e.target.checked ? "1" : null })}
                  className="rounded border-slate-300 text-brand focus:ring-brand"
                />
                Include Amazon Success Hub contacts
              </label>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button type="button" onClick={clearAll} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline mt-4">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {filteredLeads.length > 0 ? (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <SortableHeader label="Lead Date" sortKey="leadAt" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Source" sortKey="source" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Seller Type" sortKey="sellerType" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Stage" sortKey="stage" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Registered" sortKey="registeredAt" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Trial" sortKey="trialStartedAt" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Customer" sortKey="customerSince" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Plan" sortKey="planName" current={sortKey} dir={sortDir} onSort={onSort} />
                <SortableHeader label="Last Outreach" sortKey="lastOutreachAt" current={sortKey} dir={sortDir} onSort={onSort} />
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(lead.leadAt)}</td>
                  <td className="px-2 py-2.5">
                    <LeadNameCell lead={lead} />
                  </td>
                  <td className="px-2 py-2.5">
                    <SourceBadge source={lead.source} />
                  </td>
                  <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">{SELLER_TYPE_LABELS[lead.sellerType]}</td>
                  <td className="px-2 py-2.5">
                    <StageBadge stage={lead.stage} />
                  </td>
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(lead.registeredAt)}</td>
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(lead.trialStartedAt)}</td>
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(lead.customerSince)}</td>
                  <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">
                    {lead.planName ?? "—"}
                    {lead.mrr > 0 ? ` (${money(lead.mrr)})` : ""}
                  </td>
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">{fmtDate(lead.lastOutreachAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No leads match these filters.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversion + Facebook demographics
// ---------------------------------------------------------------------------

function pctLabel(v: number | null) {
  return v == null ? "—" : `${v}%`;
}

function ConversionCard({ totals }: { totals: LeadsTotals }) {
  const rows = ALL_SOURCES.map((s) => ({ source: s, ...totals.conversion.bySource[s] })).filter((r) => r.leads > 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">Conversion</h2>
      <div className="overflow-x-auto -mx-2 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-2 py-2">Source</th>
              <th className="px-2 py-2">Leads</th>
              <th className="px-2 py-2">Registered</th>
              <th className="px-2 py-2">Trials</th>
              <th className="px-2 py-2">Customers</th>
              <th className="px-2 py-2">Lead → Account</th>
              <th className="px-2 py-2">Account → Trial</th>
              <th className="px-2 py-2">Trial → Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100 font-bold">
              <td className="px-2 py-2.5">All</td>
              <td className="px-2 py-2.5">{totals.conversion.overall.leads}</td>
              <td className="px-2 py-2.5">{totals.conversion.overall.registered}</td>
              <td className="px-2 py-2.5">{totals.conversion.overall.trials}</td>
              <td className="px-2 py-2.5">{totals.conversion.overall.customers}</td>
              <td className="px-2 py-2.5">{pctLabel(totals.conversion.overall.leadToRegisteredPct)}</td>
              <td className="px-2 py-2.5">{pctLabel(totals.conversion.overall.registeredToTrialPct)}</td>
              <td className="px-2 py-2.5">{pctLabel(totals.conversion.overall.trialToCustomerPct)}</td>
            </tr>
            {rows.map((r) => (
              <tr key={r.source} className="border-t border-slate-100">
                <td className="px-2 py-2.5">{SOURCE_LABELS[r.source]}</td>
                <td className="px-2 py-2.5">{r.leads}</td>
                <td className="px-2 py-2.5">{r.registered}</td>
                <td className="px-2 py-2.5">{r.trials}</td>
                <td className="px-2 py-2.5">{r.customers}</td>
                <td className="px-2 py-2.5">{pctLabel(r.leadToRegisteredPct)}</td>
                <td className="px-2 py-2.5">{pctLabel(r.registeredToTrialPct)}</td>
                <td className="px-2 py-2.5">{pctLabel(r.trialToCustomerPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="text-sm font-black text-slate-900 mb-3">Last 8 weeks</h3>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-2 py-2">Week</th>
              <th className="px-2 py-2">Leads</th>
              <th className="px-2 py-2">Registered</th>
              <th className="px-2 py-2">Trials</th>
              <th className="px-2 py-2">Customers</th>
            </tr>
          </thead>
          <tbody>
            {totals.weekly.map((w) => (
              <tr key={w.week} className="border-t border-slate-100">
                <td className="px-2 py-2.5 whitespace-nowrap">{w.week}</td>
                <td className="px-2 py-2.5">{w.leadsCreated}</td>
                <td className="px-2 py-2.5">{w.registered}</td>
                <td className="px-2 py-2.5">{w.trials}</td>
                <td className="px-2 py-2.5">{w.customers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FacebookDemographicsCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">Facebook Audience</h2>
      <p className="text-xs text-slate-500 mb-4">
        Meta&apos;s lead forms don&apos;t expose age or gender per lead. These figures are aggregate numbers from Ads Manager, kept by
        hand below.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Men</div>
          <div className="text-2xl font-black text-slate-900">{demographics.men.pct}%</div>
          <div className="text-xs text-slate-400">
            {demographics.men.leads} leads · ${demographics.men.costPerLead.toFixed(2)}/lead
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Women</div>
          <div className="text-2xl font-black text-slate-900">{demographics.women.pct}%</div>
          <div className="text-xs text-slate-400">
            {demographics.women.leads} leads · ${demographics.women.costPerLead.toFixed(2)}/lead
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-2 py-2">Age</th>
              <th className="px-2 py-2">Men</th>
              <th className="px-2 py-2">Women</th>
            </tr>
          </thead>
          <tbody>
            {demographics.byAge.map((row) => (
              <tr key={row.range} className="border-t border-slate-100">
                <td className="px-2 py-2.5">{row.range}</td>
                <td className="px-2 py-2.5">{row.men}</td>
                <td className="px-2 py-2.5">{row.women}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-4">
        {demographics.period} · {demographics.campaign}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function LeadDesk() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("leadAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filters = useLeadFilters();

  const load = useCallback(async (fresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/leads${fresh ? "?fresh=1" : ""}`), { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveLeads = useMemo(() => {
    if (!data) return [];
    return data.leads.map((l) => {
      const override = overrides[l.id];
      if (!override || l.lastOutreachAt === override) return l;
      return { ...l, lastOutreachAt: override, outreachCount: l.outreachCount + 1 };
    });
  }, [data, overrides]);

  // Amazon Success Hub webinar imports aren't sales leads in any funnel sense
  // — excluded from the queues and the goal tracker unconditionally (not tied
  // to the All Leads table's own "include ASH" filter).
  const nonAshLeads = useMemo(() => effectiveLeads.filter((l) => l.source !== "ash"), [effectiveLeads]);

  const queues = useMemo(() => computeQueues(nonAshLeads), [nonAshLeads]);

  const filteredLeads = useMemo(
    () => sortLeads(applyFilters(effectiveLeads, filters), sortKey, sortDir),
    // filters is a fresh object each render (derived from the URL), so its
    // primitive fields are the real dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      effectiveLeads,
      sortKey,
      sortDir,
      filters.source.join(","),
      filters.stage.join(","),
      filters.sellerType.join(","),
      filters.from,
      filters.to,
      filters.q,
      filters.outreach,
      filters.tag,
      filters.ash,
    ],
  );

  const onSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("desc");
      return key;
    });
  }, []);

  const markContacted = useCallback(
    async (lead: Lead) => {
      setActionError(null);
      setPendingIds((prev) => new Set(prev).add(lead.id));
      try {
        const res = await fetch(apiUrl("/api/leads/action"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id, action: "contacted", by: data?.loggedInAs ?? "" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
        setOverrides((prev) => ({ ...prev, [lead.id]: json.outreachDate as string }));
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to mark contacted");
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
      }
    },
    [data?.loggedInAs],
  );

  return (
    <section className="relative min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Lead Desk</h1>
            <p className="text-sm text-slate-500 mt-1">Every lead, every source, one queue to call.</p>
          </div>
          <div className="flex items-center gap-3">
            {data?.loggedInAs && <span className="text-xs font-bold text-slate-500 hidden sm:inline">Signed in as {data.loggedInAs}</span>}
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </a>
            <button
              onClick={() => load(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
        {actionError && <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{actionError}</div>}
        {data && data.warnings.length > 0 && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 space-y-1">
            {data.warnings.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
        )}

        {loading && !data ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : data ? (
          <div className="space-y-8">
            <GoalTrackerCard leads={nonAshLeads} goal={data.goalTrials} goalMonth={data.goalMonth} />

            <div className="grid gap-6">
              <QueueSection
                title="Account, no trial"
                leads={queues.q1}
                dateLabel="Lead date"
                getDate={(l) => l.leadAt}
                emptyText="Nobody's waiting here."
                onMarkContacted={markContacted}
                pendingIds={pendingIds}
              />
              <QueueSection
                title="PrimeWell lead, no account"
                leads={queues.q2}
                dateLabel="Lead date"
                getDate={(l) => l.leadAt}
                emptyText="Nobody's waiting here."
                onMarkContacted={markContacted}
                pendingIds={pendingIds}
              />
              <QueueSection
                title="Trial ending soon"
                leads={queues.q3}
                dateLabel="Trial ends"
                getDate={(l) => l.trialEndsAt}
                emptyText="No trials ending in the next 3 days."
                onMarkContacted={markContacted}
                pendingIds={pendingIds}
              />
              <QueueSection
                title="New leads, not contacted"
                leads={queues.q4}
                dateLabel="Lead date"
                getDate={(l) => l.leadAt}
                emptyText="Nothing new in the last 48 hours."
                onMarkContacted={markContacted}
                pendingIds={pendingIds}
              />
              <QueueSection
                title="Contacted before, still not moved"
                leads={queues.q5}
                dateLabel="Last outreach"
                getDate={(l) => l.lastOutreachAt}
                emptyText="Nobody's overdue."
                onMarkContacted={markContacted}
                pendingIds={pendingIds}
              />
            </div>

            <AllLeadsSection filters={filters} filteredLeads={filteredLeads} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />

            <ConversionCard totals={data.totals} />

            <FacebookDemographicsCard />

            <p className="text-xs text-slate-400 text-right">Last updated {new Date(data.generatedAt).toLocaleString()}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
