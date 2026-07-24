"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Facebook,
  Inbox,
  Mail,
  Megaphone,
  RefreshCw,
  Rocket,
  ShoppingBag,
  Target,
  Users,
  X,
} from "lucide-react";
import type {
  DashboardSummary,
  GhlLeadRow,
  LeadSource,
  StripeSubscriptionRow,
  Temperature,
  TrialRow,
} from "../../lib/dashboard/types";
import { downloadCsv } from "../../lib/dashboard/csv";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const SOURCE_LABELS: Record<string, string> = {
  primewell: "PrimeWell",
  apex: "Apex",
  facebook: "Facebook",
  ash: "ASH",
  unknown: "Unknown",
  google: "Google",
  bing: "Bing",
  instagram: "Instagram",
  direct: "Direct",
};

const SOURCE_TAG_TONE: Record<LeadSource, "purple" | "blue" | "amber" | "slate"> = {
  primewell: "purple",
  facebook: "blue",
  ash: "amber",
  unknown: "slate",
};

function SourceBadge({ source }: { source: LeadSource }) {
  return <Badge tone={SOURCE_TAG_TONE[source]}>{SOURCE_LABELS[source]}</Badge>;
}

const EVENT_LABELS: Record<string, string> = {
  apex_landing: "Landed on Apex",
  apex_signup: "Apex signup",
};

interface Metric {
  icon: typeof BadgeDollarSign;
  label: string;
  value: string | null;
  accent?: boolean;
  onClick?: () => void;
}

function FunnelStep({
  label,
  value,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  accent?: boolean;
  suffix?: string;
}) {
  return (
    <div className={`rounded-xl px-4 py-3 ${accent ? "bg-brand/5 border border-brand/30" : "bg-slate-50"}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-2xl font-black ${accent ? "text-brand" : "text-slate-900"}`}>
        {value}
        {suffix}
      </div>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "green" | "slate" | "red" | "amber" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const toneClasses = {
    green: "bg-green-50 text-green-700 border-green-200",
    slate: "bg-slate-50 text-slate-500 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }[tone];
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${toneClasses}`}>
      {children}
    </span>
  );
}

const TEMPERATURE_STYLES: Record<Temperature, { label: string; className: string }> = {
  cold: { label: "Cold", className: "bg-blue-100 text-blue-900 border-blue-200" },
  cool: { label: "Cool", className: "bg-sky-50 text-sky-600 border-sky-200" },
  warm: { label: "Warm", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  hot: { label: "Hot", className: "bg-orange-50 text-orange-700 border-orange-200" },
  very_hot: { label: "Very Hot", className: "bg-red-50 text-red-700 border-red-200" },
};

const TEMPERATURE_ORDER: Temperature[] = ["cold", "cool", "warm", "hot", "very_hot"];

function TemperatureBadge({
  temperature,
  checked,
  converted,
}: {
  temperature: Temperature | null;
  checked: boolean;
  converted: boolean;
}) {
  // "Goes away" once they've subscribed to Apex — there's no more lead to
  // keep warming up, so a color badge here would be noise, not signal.
  if (converted) return <Badge tone="green">Converted</Badge>;
  if (!checked || !temperature) return <Badge tone="slate">…</Badge>;
  const { label, className } = TEMPERATURE_STYLES[temperature];
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function CopyableEmail({ email, bold }: { email: string | null; bold?: boolean }) {
  const [copied, setCopied] = useState(false);

  if (!email) return <span className="text-slate-400">—</span>;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently no-op.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy"
      className={`group inline-flex items-center gap-1.5 text-left hover:text-brand ${bold ? "font-bold text-slate-900" : ""}`}
    >
      <span className="group-hover:underline">{email}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand shrink-0" />
      )}
    </button>
  );
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function InvoiceCountdown({ iso }: { iso: string | null }) {
  const days = daysUntil(iso);
  if (days == null) return <span className="text-slate-400">—</span>;
  if (days < 0) return <Badge tone="red">Overdue</Badge>;
  if (days === 0) return <Badge tone="red">Today</Badge>;
  if (days <= 3) return <Badge tone="red">{days}d</Badge>;
  if (days <= 7) return <Badge tone="amber">{days}d</Badge>;
  return <Badge tone="slate">{days}d</Badge>;
}

function MetricCard({ icon: Icon, label, value, accent, onClick }: Metric) {
  const clickable = Boolean(onClick && value != null);
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`rounded-2xl border px-5 py-5 ${
        accent ? "border-brand/30 bg-brand/5" : "border-slate-200 bg-white"
      } ${clickable ? "cursor-pointer hover:border-brand/40 hover:shadow-md transition-shadow" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accent ? "text-brand" : "text-slate-400"}`} strokeWidth={2.25} />
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      </div>
      <div className={`text-3xl font-black ${value != null ? "text-slate-900" : "text-slate-300"}`}>
        {value ?? "Connect"}
      </div>
      {clickable && <div className="text-xs text-brand font-bold mt-1">View details →</div>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-20">
      <div
        role="presentation"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function SubscriptionsModal({
  mode,
  subscriptions,
  truncated,
  onClose,
}: {
  mode: "mrr" | "arr";
  subscriptions: StripeSubscriptionRow[];
  truncated: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  // MRR view = real monthly-billed cash, so annual-plan rows (which show $0
  // MRR contribution by design) are excluded rather than shown as zeroes.
  const scoped = useMemo(
    () => subscriptions.filter((s) => (mode === "mrr" ? s.mrrContribution > 0 : s.arrContribution > 0)),
    [subscriptions, mode],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter((s) =>
      `${s.customerName ?? ""} ${s.customerEmail ?? ""} ${s.planName}`.toLowerCase().includes(q),
    );
  }, [scoped, search]);

  const contributionLabel = mode === "mrr" ? "MRR" : "ARR";

  const exportCsv = () => {
    downloadCsv(
      `stripe-${mode}-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Customer Name",
        "Customer Email",
        "Source",
        "Plan",
        "Amount",
        "Interval",
        `${contributionLabel} Contribution`,
        "Status",
        "Started",
        "Next Invoice",
      ],
      filtered.map((s) => [
        s.customerName ?? "",
        s.customerEmail ?? "",
        SOURCE_LABELS[s.source],
        s.planName,
        s.amount.toFixed(2),
        s.interval ?? "",
        (mode === "mrr" ? s.mrrContribution : s.arrContribution).toFixed(2),
        s.status,
        new Date(s.startedAt).toLocaleDateString(),
        s.nextInvoiceAt ? new Date(s.nextInvoiceAt).toLocaleDateString() : "",
      ]),
    );
  };

  return (
    <Modal
      title={mode === "mrr" ? "Monthly Subscriptions & Customers" : "Annual Subscriptions & Customers"}
      onClose={onClose}
    >
      <p className="text-xs text-slate-500 mb-4">
        {mode === "mrr"
          ? "Real cash billed monthly — annual plans are excluded here and tracked in ARR instead."
          : "Annual-plan customers — the full yearly amount, not amortized into MRR."}
      </p>
      {truncated && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Showing the first 100 active subscriptions — there may be more.
        </p>
      )}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, email, plan…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>
      {filtered.length > 0 ? (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Source</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">{contributionLabel}</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Since</th>
                <th className="px-2 py-2">Next Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-2 py-2.5 text-slate-900 font-bold whitespace-nowrap">
                    {s.customerName ?? "—"}
                  </td>
                  <td className="px-2 py-2.5 text-slate-700">
                    <CopyableEmail email={s.customerEmail} />
                  </td>
                  <td className="px-2 py-2.5">
                    <SourceBadge source={s.source} />
                  </td>
                  <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">{s.planName}</td>
                  <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">
                    {money(s.amount)}
                    {s.interval ? `/${s.interval}` : ""}
                  </td>
                  <td className="px-2 py-2.5 text-slate-700">
                    {money(mode === "mrr" ? s.mrrContribution : s.arrContribution)}
                  </td>
                  <td className="px-2 py-2.5">
                    <Badge tone={s.status === "active" ? "green" : "slate"}>{s.status}</Badge>
                  </td>
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">
                    {new Date(s.startedAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap">
                    <InvoiceCountdown iso={s.nextInvoiceAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No subscriptions match this search.</p>
      )}
    </Modal>
  );
}

function TrialsModal({
  trials,
  truncated,
  potentialMrr,
  potentialArr,
  onClose,
}: {
  trials: TrialRow[];
  truncated: boolean;
  potentialMrr: number;
  potentialArr: number;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trials;
    return trials.filter((t) =>
      `${t.customerName ?? ""} ${t.customerEmail ?? ""} ${t.planName}`.toLowerCase().includes(q),
    );
  }, [trials, search]);

  // Soonest-ending trials first — those are the ones about to convert (or churn).
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const aTime = a.trialEndAt ? new Date(a.trialEndAt).getTime() : Infinity;
        const bTime = b.trialEndAt ? new Date(b.trialEndAt).getTime() : Infinity;
        return aTime - bTime;
      }),
    [filtered],
  );

  const exportCsv = () => {
    downloadCsv(
      `stripe-trials-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Customer Name",
        "Customer Email",
        "Source",
        "Plan",
        "Amount",
        "Interval",
        "Predicted MRR",
        "Predicted ARR",
        "Trial Started",
        "Trial Ends",
      ],
      sorted.map((t) => [
        t.customerName ?? "",
        t.customerEmail ?? "",
        SOURCE_LABELS[t.source],
        t.planName,
        t.amount.toFixed(2),
        t.interval ?? "",
        t.predictedMrrContribution.toFixed(2),
        t.predictedArrContribution.toFixed(2),
        t.trialStartAt ? new Date(t.trialStartAt).toLocaleDateString() : "",
        t.trialEndAt ? new Date(t.trialEndAt).toLocaleDateString() : "",
      ]),
    );
  };

  return (
    <Modal title="Trials Started" onClose={onClose}>
      <p className="text-xs text-slate-500 mb-4">
        Customers currently on a free trial. "Days Left" is when they'll be charged (or drop off) —
        the predicted totals show what your MRR/ARR would become if every trial converts.
      </p>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <FunnelStep label="Trials Started" value={trials.length} accent />
        <div className="rounded-xl px-4 py-3 bg-slate-50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Potential MRR Added
          </div>
          <div className="text-2xl font-black text-slate-900">{money(potentialMrr)}</div>
        </div>
        <div className="rounded-xl px-4 py-3 bg-slate-50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Potential ARR Added
          </div>
          <div className="text-2xl font-black text-slate-900">{money(potentialArr)}</div>
        </div>
      </div>
      {truncated && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Showing the first 100 trials — there may be more.
        </p>
      )}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, email, plan…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          onClick={exportCsv}
          disabled={sorted.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>
      {sorted.length > 0 ? (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Source</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Days Left</th>
                <th className="px-2 py-2">Trial Ends</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-2 py-2.5 text-slate-900 font-bold whitespace-nowrap">
                    {t.customerName ?? "—"}
                  </td>
                  <td className="px-2 py-2.5 text-slate-700">
                    <CopyableEmail email={t.customerEmail} />
                  </td>
                  <td className="px-2 py-2.5">
                    <SourceBadge source={t.source} />
                  </td>
                  <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">{t.planName}</td>
                  <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">
                    {money(t.amount)}
                    {t.interval ? `/${t.interval}` : ""}
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap">
                    <InvoiceCountdown iso={t.trialEndAt} />
                  </td>
                  <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">
                    {t.trialEndAt ? new Date(t.trialEndAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {trials.length === 0 ? "No active trials right now." : "No trials match this search."}
        </p>
      )}
    </Modal>
  );
}

type TriState = "all" | "yes" | "no";
type SubscribedFilter = "all" | "yes" | "no" | "unknown";
const PAGE_SIZE = 50;

interface StripeStatusOverride {
  isApexSubscriber: boolean;
  isPayingCustomer: boolean;
  customerSince: string | null;
  planName: string | null;
  ltv: number;
}

interface TemperatureOverride {
  temperature: Temperature;
  lastMessageAt: string | null;
  hasReplied: boolean;
}

function GhlLeadsTable({
  rows,
  signupsConnected,
  sourceLabel,
  csvPrefix,
  source,
}: {
  rows: GhlLeadRow[];
  signupsConnected: boolean;
  sourceLabel: string;
  csvPrefix: string;
  source: "primewell" | "ash" | "facebook";
}) {
  const [search, setSearch] = useState("");
  const [payingFilter, setPayingFilter] = useState<TriState>("all");
  const [subscribedFilter, setSubscribedFilter] = useState<SubscribedFilter>("all");
  const [temperatureFilter, setTemperatureFilter] = useState<Set<Temperature>>(new Set());
  const [page, setPage] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, StripeStatusOverride>>({});
  const [temperatureOverrides, setTemperatureOverrides] = useState<Record<string, TemperatureOverride>>({});
  const [checking, setChecking] = useState(false);
  const [checkingAllForFilter, setCheckingAllForFilter] = useState(false);
  const [exporting, setExporting] = useState(false);
  const temperatureInFlightRef = useRef<Set<string>>(new Set());

  const mergedRows = useMemo(
    () =>
      rows.map((row) => {
        const override = overrides[row.email];
        const tempOverride = temperatureOverrides[row.id];
        return {
          ...row,
          ...(override ? { ...override, stripeChecked: true } : {}),
          ...(tempOverride ? { temperature: tempOverride.temperature, temperatureChecked: true } : {}),
        };
      }),
    [rows, overrides, temperatureOverrides],
  );

  // Filters that don't depend on temperature — kept separate so the
  // eager-fetch-for-filter effect below knows exactly which rows need a
  // temperature check without depending on the temperature filter itself.
  const baseFilteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mergedRows.filter((row) => {
      if (q) {
        const haystack = `${row.name} ${row.email} ${row.phone ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (payingFilter === "yes" && !row.isPayingCustomer) return false;
      if (payingFilter === "no" && row.isPayingCustomer) return false;
      if (subscribedFilter !== "all") {
        const status = !signupsConnected ? "unknown" : row.isApexSubscriber ? "yes" : "no";
        if (status !== subscribedFilter) return false;
      }
      return true;
    });
  }, [mergedRows, search, payingFilter, subscribedFilter, signupsConnected]);

  const filteredRows = useMemo(() => {
    if (temperatureFilter.size === 0) return baseFilteredRows;
    return baseFilteredRows.filter((row) => {
      // Converted leads don't need approaching — never show them under a
      // temperature filter regardless of their underlying (pre-conversion) tier.
      if (row.isApexSubscriber || row.isPayingCustomer) return false;
      return row.temperature != null && temperatureFilter.has(row.temperature);
    });
  }, [baseFilteredRows, temperatureFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pagedRows = filteredRows.slice(clampedPage * PAGE_SIZE, (clampedPage + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search, payingFilter, subscribedFilter, temperatureFilter]);

  // Checks Stripe status for whatever emails aren't already known, in batches
  // of 100 (the server-side cap per call). Returns the freshly-fetched
  // results so callers (export) can use them immediately, not just on the
  // next render.
  const checkStripeStatus = async (emails: string[]): Promise<Record<string, StripeStatusOverride>> => {
    const toCheck = [...new Set(emails)].filter((e) => !overrides[e]);
    if (toCheck.length === 0) return {};
    const fetched: Record<string, StripeStatusOverride> = {};
    for (let i = 0; i < toCheck.length; i += 100) {
      const chunk = toCheck.slice(i, i + 100);
      try {
        const res = await fetch("/api/dashboard/primewell-stripe-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: chunk }),
        });
        if (res.ok) {
          const data = await res.json();
          Object.assign(fetched, data.results);
        }
      } catch {
        // Leave these unchecked — the UI just won't show enriched data for them yet.
      }
    }
    if (Object.keys(fetched).length > 0) {
      setOverrides((prev) => ({ ...prev, ...fetched }));
    }
    return fetched;
  };

  // Checks reply/engagement-based temperature for whatever contact IDs
  // aren't already known, in batches of 100 (the server-side cap per call).
  // Guards against in-flight duplicates — GHL's /conversations/search is rate
  // limited tightly enough that two overlapping callers (e.g. the page
  // auto-enrich effect and the filter's eager-fetch effect both wanting the
  // same ids before either's state update has landed) would otherwise double
  // the request volume and trigger far more 429s.
  const checkTemperature = async (contactIds: string[]): Promise<Record<string, TemperatureOverride>> => {
    const toCheck = [...new Set(contactIds)].filter(
      (id) => !temperatureOverrides[id] && !temperatureInFlightRef.current.has(id),
    );
    if (toCheck.length === 0) return {};
    toCheck.forEach((id) => temperatureInFlightRef.current.add(id));
    const fetched: Record<string, TemperatureOverride> = {};
    try {
      for (let i = 0; i < toCheck.length; i += 100) {
        const chunk = toCheck.slice(i, i + 100);
        try {
          const res = await fetch("/api/dashboard/lead-temperature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source, contactIds: chunk }),
          });
          if (res.ok) {
            const data = await res.json();
            Object.assign(fetched, data.results);
          }
        } catch {
          // Leave these unchecked — the UI just won't show a temperature for them yet.
        }
      }
    } finally {
      toCheck.forEach((id) => temperatureInFlightRef.current.delete(id));
    }
    if (Object.keys(fetched).length > 0) {
      setTemperatureOverrides((prev) => ({ ...prev, ...fetched }));
    }
    return fetched;
  };

  // Auto-enrich Stripe status for whichever rows land on the visible page.
  // Temperature is handled by a single effect below instead of also being
  // fetched here — two effects independently fetching overlapping contact
  // ids raced against GHL's tight rate limit on /conversations/search and
  // doubled the failure rate in testing.
  useEffect(() => {
    const uncheckedEmails = pagedRows.filter((r) => !r.stripeChecked).map((r) => r.email);
    if (uncheckedEmails.length === 0) return;
    setChecking(true);
    checkStripeStatus(uncheckedEmails).finally(() => setChecking(false));
    // Re-run whenever the visible page's underlying data changes.
  }, [clampedPage, filteredRows]);

  // Fetches temperature for whichever contacts currently need it: just the
  // visible page normally, but the ENTIRE (pre-temperature-filter) result set
  // once a temperature filter is active, since filtering needs to know every
  // candidate's temperature, not just what's on screen. Converted leads are
  // skipped since they're excluded from the filter and shown as "Converted"
  // regardless of temperature.
  useEffect(() => {
    const source = temperatureFilter.size > 0 ? baseFilteredRows : pagedRows;
    const uncheckedIds = source
      .filter((r) => !r.temperatureChecked && !r.isApexSubscriber && !r.isPayingCustomer)
      .map((r) => r.id);
    if (uncheckedIds.length === 0) return;
    const filterActive = temperatureFilter.size > 0;
    if (filterActive) setCheckingAllForFilter(true);
    else setChecking(true);
    checkTemperature(uncheckedIds).finally(() => {
      if (filterActive) setCheckingAllForFilter(false);
      else setChecking(false);
    });
  }, [temperatureFilter, baseFilteredRows, pagedRows]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const unchecked = filteredRows.filter((r) => !r.stripeChecked).map((r) => r.email);
      const uncheckedIds = filteredRows.filter((r) => !r.temperatureChecked).map((r) => r.id);
      const [freshlyFetched, freshlyFetchedTemps] = await Promise.all([
        checkStripeStatus(unchecked),
        checkTemperature(uncheckedIds),
      ]);
      const finalRows = filteredRows.map((row) => {
        const override = freshlyFetched[row.email];
        const tempOverride = freshlyFetchedTemps[row.id];
        return {
          ...row,
          ...(override ?? {}),
          ...(tempOverride
            ? { temperature: tempOverride.temperature, temperatureChecked: true }
            : {}),
        };
      });
      downloadCsv(
        `${csvPrefix}-leads-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          "Name",
          "Email",
          "Phone",
          `Joined ${sourceLabel}`,
          "Subscribed to Apex",
          "Paying Customer",
          "Customer Since",
          "Plan",
          "LTV",
          "Temperature",
        ],
        finalRows.map((row) => [
          row.name,
          row.email,
          row.phone ?? "",
          row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : "",
          !signupsConnected ? "Unknown" : row.isApexSubscriber ? "Yes" : "No",
          row.isPayingCustomer ? "Yes" : "No",
          row.customerSince ? new Date(row.customerSince).toLocaleDateString() : "",
          row.planName ?? "",
          row.ltv.toFixed(2),
          row.isApexSubscriber || row.isPayingCustomer
            ? "Converted"
            : !row.temperatureChecked || !row.temperature
              ? "Unknown"
              : TEMPERATURE_STYLES[row.temperature].label,
        ]),
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="flex-1 min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          value={payingFilter}
          onChange={(e) => setPayingFilter(e.target.value as TriState)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
        >
          <option value="all">Paying: All</option>
          <option value="yes">Paying: Yes</option>
          <option value="no">Paying: No</option>
        </select>
        <select
          value={subscribedFilter}
          onChange={(e) => setSubscribedFilter(e.target.value as SubscribedFilter)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
        >
          <option value="all">Subscribed: All</option>
          <option value="yes">Subscribed: Yes</option>
          <option value="no">Subscribed: No</option>
          <option value="unknown">Subscribed: Unknown</option>
        </select>
        <button
          onClick={exportCsv}
          disabled={filteredRows.length === 0 || exporting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? "Preparing…" : "Export CSV"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Temperature:</span>
        {TEMPERATURE_ORDER.map((temp) => {
          const active = temperatureFilter.has(temp);
          const { label, className } = TEMPERATURE_STYLES[temp];
          return (
            <button
              key={temp}
              type="button"
              onClick={() =>
                setTemperatureFilter((prev) => {
                  const next = new Set(prev);
                  if (next.has(temp)) next.delete(temp);
                  else next.add(temp);
                  return next;
                })
              }
              className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${
                active ? className : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
              }`}
            >
              {label}
            </button>
          );
        })}
        {temperatureFilter.size > 0 && (
          <button
            type="button"
            onClick={() => setTemperatureFilter(new Set())}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
          >
            Clear
          </button>
        )}
        {checkingAllForFilter && (
          <span className="text-xs text-slate-400">checking engagement for all matching leads…</span>
        )}
      </div>

      {filteredRows.length > 0 ? (
        <>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-2 py-2">Joined</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Subscribed to Apex</th>
                  <th className="px-2 py-2">Paying Customer</th>
                  <th className="px-2 py-2">Customer Since</th>
                  <th className="px-2 py-2">Plan</th>
                  <th className="px-2 py-2">LTV</th>
                  <th className="px-2 py-2">Temperature</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.email} className="border-t border-slate-100">
                    <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">
                      {row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-2.5 text-slate-900 font-bold">{row.name}</td>
                    <td className="px-2 py-2.5 text-slate-700">
                      <CopyableEmail email={row.email} />
                    </td>
                    <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">{row.phone ?? "—"}</td>
                    <td className="px-2 py-2.5">
                      {!row.stripeChecked ? (
                        <Badge tone="slate">…</Badge>
                      ) : !signupsConnected ? (
                        <Badge tone="slate">Unknown</Badge>
                      ) : row.isApexSubscriber ? (
                        <Badge tone="green">Yes</Badge>
                      ) : (
                        <Badge tone="slate">No</Badge>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {!row.stripeChecked ? (
                        <Badge tone="slate">…</Badge>
                      ) : row.isPayingCustomer ? (
                        <Badge tone="green">Yes</Badge>
                      ) : (
                        <Badge tone="slate">No</Badge>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">
                      {row.customerSince ? new Date(row.customerSince).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-2.5 text-slate-700 whitespace-nowrap">{row.planName ?? "—"}</td>
                    <td className="px-2 py-2.5 text-slate-700">{money(row.ltv)}</td>
                    <td className="px-2 py-2.5">
                      <TemperatureBadge
                        temperature={row.temperature}
                        checked={row.temperatureChecked}
                        converted={row.isApexSubscriber || row.isPayingCustomer}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-500">
              Showing {clampedPage * PAGE_SIZE + 1}-{Math.min((clampedPage + 1) * PAGE_SIZE, filteredRows.length)}{" "}
              of {filteredRows.length}
              {checking ? " · checking status…" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={clampedPage === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {clampedPage + 1} of {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={clampedPage >= pageCount - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          {rows.length === 0 ? `No ${sourceLabel} leads recorded yet.` : "No leads match these filters."}
        </p>
      )}
    </>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionsModal, setSubscriptionsModal] = useState<"mrr" | "arr" | null>(null);
  const [showTrialsModal, setShowTrialsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"primewell" | "facebook" | "ash" | "apex" | "leads">("primewell");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const metrics: Metric[] | null = data
    ? [
        {
          icon: Target,
          label: "Cost Per Lead (30d)",
          value: data.blended.costPerLead30d != null ? money(data.blended.costPerLead30d) : null,
          accent: true,
        },
        {
          icon: Target,
          label: "Cost Per Sale (30d)",
          value: data.blended.costPerSale30d != null ? money(data.blended.costPerSale30d) : null,
          accent: true,
        },
        {
          icon: Megaphone,
          label: "Ad Spend (30d)",
          value: data.meta.connected ? money(data.meta.spend30d) : null,
        },
        {
          icon: BadgeDollarSign,
          label: "MRR",
          value: data.stripe.connected ? money(data.stripe.mrr) : null,
          onClick: () => setSubscriptionsModal("mrr"),
        },
        {
          icon: BadgeDollarSign,
          label: "ARR",
          value: data.stripe.connected ? money(data.stripe.arr) : null,
          onClick: () => setSubscriptionsModal("arr"),
        },
        {
          icon: Users,
          label: "Trials Started",
          value: data.stripe.connected ? String(data.stripe.trials.length) : null,
          onClick: () => setShowTrialsModal(true),
        },
        {
          icon: Users,
          label: "Facebook Leads (30d)",
          value: data.facebook.connected ? String(data.facebook.newLeads30d) : null,
        },
        {
          icon: Mail,
          label: "Subscribers",
          value: data.mailchimp.connected ? String(data.mailchimp.totalSubscribers) : null,
        },
      ]
    : null;

  return (
    <section className="relative min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Marketing Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Your acquisition numbers, at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : metrics && data ? (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>

            <div className="inline-flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm">
              {(
                [
                  { id: "primewell", label: "PrimeWell Funnel", icon: Users },
                  { id: "facebook", label: "Facebook Funnel", icon: Facebook },
                  { id: "ash", label: "ASH Funnel", icon: ShoppingBag },
                  { id: "apex", label: "Apex Funnel", icon: Rocket },
                  { id: "leads", label: "All Leads", icon: Inbox },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "primewell" && (
              <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">
                    PrimeWell → Apex Funnel
                  </h2>
                  {data.primewell.connected ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <FunnelStep label="PrimeWell Leads" value={data.primewell.totalLeads} />
                      <FunnelStep label="New Leads (7d)" value={data.primewell.newLeads7d} />
                      <FunnelStep label="New Leads (30d)" value={data.primewell.newLeads30d} />
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                      <FunnelStep label="PrimeWell → Apex Converts" value={data.primewell.crossConverted} accent />
                    </div>
                  ) : null}
                  {data.primewell.connected && data.primewell.crossConvertedTruncated && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                      "PrimeWell → Apex Converts" only checked a subset of leads/signups (list too large to
                      fully cross-reference on every page load) — the real number may be slightly higher.
                    </p>
                  )}
                  {!data.primewell.connected && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      {data.primewell.error ?? "PrimeWell tracking is not configured yet."}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">PrimeWell Leads</h2>
                  {data.primewell.connected ? (
                    <>
                      {!data.signups.connected && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          "Subscribed to Apex" shows Unknown until Supabase is connected — that's what tracks
                          free Apex signups.
                        </p>
                      )}
                      {data.primewell.rows.length < data.primewell.totalLeads && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          Showing the {data.primewell.rows.length} most recent leads out of{" "}
                          {data.primewell.totalLeads} total — the rest couldn't be fetched this time, try
                          refreshing.
                        </p>
                      )}
                      <GhlLeadsTable
                        rows={data.primewell.rows}
                        signupsConnected={data.signups.connected}
                        sourceLabel="PrimeWell"
                        csvPrefix="primewell"
                        source="primewell"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">Connect PrimeWell's GHL to see leads here.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "facebook" && (
              <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">
                    Facebook → Apex Funnel
                  </h2>
                  {data.facebook.connected ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <FunnelStep label="Facebook Leads" value={data.facebook.totalLeads} />
                      <FunnelStep label="New Leads (7d)" value={data.facebook.newLeads7d} />
                      <FunnelStep label="New Leads (30d)" value={data.facebook.newLeads30d} />
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                      <FunnelStep label="Facebook → Apex Converts" value={data.facebook.crossConverted} accent />
                    </div>
                  ) : null}
                  {data.facebook.connected && data.facebook.crossConvertedTruncated && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                      "Facebook → Apex Converts" only checked a subset of leads/signups (list too large to
                      fully cross-reference on every page load) — the real number may be slightly higher.
                    </p>
                  )}
                  {!data.facebook.connected && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      {data.facebook.error ?? "Facebook lead tracking is not configured yet."}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">Facebook Leads</h2>
                  {data.facebook.connected ? (
                    <>
                      {!data.signups.connected && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          "Subscribed to Apex" shows Unknown until Supabase is connected — that's what tracks
                          free Apex signups.
                        </p>
                      )}
                      {data.facebook.rows.length < data.facebook.totalLeads && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          Showing the {data.facebook.rows.length} most recent leads out of{" "}
                          {data.facebook.totalLeads} total — the rest couldn't be fetched this time, try
                          refreshing.
                        </p>
                      )}
                      <GhlLeadsTable
                        rows={data.facebook.rows}
                        signupsConnected={data.signups.connected}
                        sourceLabel="Facebook"
                        csvPrefix="facebook"
                        source="facebook"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">Connect Apex Applications' GHL to see leads here.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ash" && (
              <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">
                    ASH → Apex Funnel
                  </h2>
                  {data.ash.connected ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <FunnelStep label="ASH Leads" value={data.ash.totalLeads} />
                      <FunnelStep label="New Leads (7d)" value={data.ash.newLeads7d} />
                      <FunnelStep label="New Leads (30d)" value={data.ash.newLeads30d} />
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                      <FunnelStep label="ASH → Apex Converts" value={data.ash.crossConverted} accent />
                    </div>
                  ) : null}
                  {data.ash.connected && data.ash.crossConvertedTruncated && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                      "ASH → Apex Converts" only checked a subset of leads/signups (list too large to
                      fully cross-reference on every page load) — the real number may be slightly higher.
                    </p>
                  )}
                  {!data.ash.connected && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      {data.ash.error ?? "ASH lead tracking is not configured yet."}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">ASH Leads</h2>
                  {data.ash.connected ? (
                    <>
                      {!data.signups.connected && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          "Subscribed to Apex" shows Unknown until Supabase is connected — that's what tracks
                          free Apex signups.
                        </p>
                      )}
                      {data.ash.rows.length < data.ash.totalLeads && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          Showing the {data.ash.rows.length} most recent leads out of{" "}
                          {data.ash.totalLeads} total — the rest couldn't be fetched this time, try
                          refreshing.
                        </p>
                      )}
                      <GhlLeadsTable
                        rows={data.ash.rows}
                        signupsConnected={data.signups.connected}
                        sourceLabel="ASH"
                        csvPrefix="ash"
                        source="ash"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">Connect Amazon Success Hub's GHL to see leads here.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "apex" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">
                  Apex Signups &amp; Revenue
                </h2>
                {data.signups.connected ? (
                  <>
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <FunnelStep label="Accounts Created" value={data.signups.totalAccounts} />
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                      <FunnelStep label="Became Clients" value={data.signups.totalPayingCustomers} accent />
                      <FunnelStep
                        label="Account → Client Rate"
                        value={
                          data.signups.totalAccounts > 0
                            ? Math.round((data.signups.totalPayingCustomers / data.signups.totalAccounts) * 100)
                            : 0
                        }
                        suffix="%"
                      />
                    </div>
                    {data.signups.payingCustomersTruncated && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                        "Became Clients" and the table below only cover the {data.signups.rows.length} most
                        recent signups out of {data.signups.totalAccounts} total.
                      </p>
                    )}
                    {data.signups.rows.length > 0 ? (
                      <div className="overflow-x-auto -mx-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                              <th className="px-2 py-2">Email</th>
                              <th className="px-2 py-2">Signed Up</th>
                              <th className="px-2 py-2">Source</th>
                              <th className="px-2 py-2">Status</th>
                              <th className="px-2 py-2">LTV</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.signups.rows.map((row) => (
                              <tr key={row.email} className="border-t border-slate-100">
                                <td className="px-2 py-2.5">
                                  <CopyableEmail email={row.email} bold />
                                </td>
                                <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">
                                  {new Date(row.signedUpAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2.5 text-slate-700">
                                  {SOURCE_LABELS[row.source] ?? row.source}
                                </td>
                                <td className="px-2 py-2.5">
                                  <div className="flex gap-1.5">
                                    {row.unsubscribed ? (
                                      <Badge tone="red">Churned</Badge>
                                    ) : row.isPayingCustomer ? (
                                      <Badge tone="green">Customer</Badge>
                                    ) : (
                                      <Badge tone="slate">Free</Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-2.5 text-slate-700">{money(row.ltv)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No Apex signups recorded yet.</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    {data.signups.error ?? "Signups tracking is not configured yet."}
                  </p>
                )}
              </div>
            )}

            {activeTab === "leads" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-5">Every Lead Coming In</h2>
                {data.leads.connected && data.leads.recent.length > 0 ? (
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-2 py-2">When</th>
                          <th className="px-2 py-2">Source</th>
                          <th className="px-2 py-2">Event</th>
                          <th className="px-2 py-2">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.leads.recent.map((lead) => (
                          <tr key={lead.id} className="border-t border-slate-100">
                            <td className="px-2 py-2.5 text-slate-500 whitespace-nowrap">
                              {new Date(lead.createdAt).toLocaleString()}
                            </td>
                            <td className="px-2 py-2.5 font-bold text-slate-900">
                              {SOURCE_LABELS[lead.source] ?? lead.source}
                            </td>
                            <td className="px-2 py-2.5 text-slate-700">
                              {EVENT_LABELS[lead.event] ?? lead.event}
                            </td>
                            <td className="px-2 py-2.5 text-slate-700">
                              <CopyableEmail email={lead.email} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : data.leads.connected ? (
                  <p className="text-sm text-slate-500">No leads recorded yet.</p>
                ) : (
                  <p className="text-sm text-slate-400">Connect Supabase to start seeing leads here.</p>
                )}
              </div>
            )}

            <p className="text-xs text-slate-400 text-right">
              Last updated {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
        ) : null}
      </div>

      {subscriptionsModal && data && (
        <SubscriptionsModal
          mode={subscriptionsModal}
          subscriptions={data.stripe.subscriptions}
          truncated={data.stripe.subscriptionsTruncated}
          onClose={() => setSubscriptionsModal(null)}
        />
      )}

      {showTrialsModal && data && (
        <TrialsModal
          trials={data.stripe.trials}
          truncated={data.stripe.trialsTruncated}
          potentialMrr={data.stripe.potentialMrr}
          potentialArr={data.stripe.potentialArr}
          onClose={() => setShowTrialsModal(false)}
        />
      )}
    </section>
  );
}
