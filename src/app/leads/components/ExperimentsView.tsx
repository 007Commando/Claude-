"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Lead, QUALIFIED_SCORE, STAGE_RANK, parseAngle } from "../../../lib/leads/model";
import type { AdSpendRow } from "../../../lib/leads/metaSpend";
import { SOURCE_LABELS, apiUrl } from "./shared";

/**
 * Experiments (Stefano, 2026-10-05): three months of funnel tests, read as
 * which ad, angle and audience brings people who pay and keep paying, how
 * fast, and at what cost.
 *
 * Every ad carries its names in its link (utm_campaign = campaign, utm_content
 * = ad, utm_term = ad set), the lead forms write them to GHL and the signup
 * keeps them on the account, so each lead knows its ad. Spend comes from
 * Meta per ad per day, visits from the Live View's per-ad counters, and
 * revenue from Stripe's charge history. Rows group by whatever is being
 * tested; leads with no ad tag fall into one row per funnel.
 */

type GroupBy = "adAdset" | "ad" | "angle" | "adset" | "campaign";
type SortKey = "spend" | "leads" | "trials" | "paid" | "rev90" | "roas" | "costPaid";

const GROUPS: { value: GroupBy; label: string }[] = [
  { value: "adAdset", label: "Ad × audience" },
  { value: "ad", label: "Ad" },
  { value: "angle", label: "Angle" },
  { value: "adset", label: "Audience" },
  { value: "campaign", label: "Campaign" },
];
const RANGES = [7, 30, 90];
const DAY_MS = 24 * 60 * 60 * 1000;

type Counters = Partial<Record<"sessions" | "leads" | "accounts" | "signup" | "paid", number>>;
type DayDoc = { day: string; ads?: Record<string, Counters>; campaigns?: Record<string, Counters> };
type ManualSpend = { months: Record<string, { primewell: number | null; facebook: number | null }> };
type SpendPayload = { rows: AdSpendRow[]; error: string | null; manual: ManualSpend };

interface Row {
  key: string;
  label: string;
  sub: string | null;
  week: string | null;
  funnels: Map<string, number>;
  spend: number;
  visits: number | null;
  leads: number;
  qualified: number;
  accounts: number;
  trials: number;
  paid: number;
  rev90: number;
  hoursToTrial: number[];
}

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** Monday of the week a date falls in, YYYY-MM-DD. Cohorts are weeks of first contact. */
function weekOf(iso: string): string {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)).toISOString().slice(0, 10);
}

/** The value a lead or a spend row is grouped by, or null when it has none. */
function groupValue(group: GroupBy, v: { campaign: string | null; ad: string | null; adset: string | null }) {
  switch (group) {
    case "adAdset":
      return v.ad ? `${v.ad}${v.adset ? ` · ${v.adset}` : ""}` : null;
    case "ad":
      return v.ad;
    case "angle":
      return parseAngle(v.ad);
    case "adset":
      return v.adset;
    case "campaign":
      return v.campaign;
  }
}

const money = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(n < 100 ? 2 : 0)}`);
const per = (spend: number, n: number) => (spend > 0 && n > 0 ? money(spend / n) : "–");
const pctOf = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function duration(hours: number | null): string {
  if (hours === null) return "–";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

export default function ExperimentsView({ leads }: { leads: Lead[] }) {
  const [days, setDays] = useState(30);
  const [group, setGroup] = useState<GroupBy>("adAdset");
  const [byWeek, setByWeek] = useState(false);
  const [sort, setSort] = useState<SortKey>("spend");
  const [spend, setSpend] = useState<SpendPayload | null>(null);
  const [traffic, setTraffic] = useState<DayDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        fetch(apiUrl(`/api/leads/experiments?days=${days}`), { cache: "no-store" }).then((r) => r.json()),
        fetch(apiUrl(`/api/leads/live?view=traffic&days=${days}`), { cache: "no-store" }).then((r) => r.json()),
      ]);
      setSpend(s as SpendPayload);
      setTraffic(Array.isArray(t?.days) ? (t.days as DayDoc[]) : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const since = useMemo(() => new Date(Date.now() - days * DAY_MS).toISOString(), [days]);

  const rows = useMemo(() => {
    const out = new Map<string, Row>();
    const rowFor = (value: string | null, fallback: string, week: string | null, sub: string | null = null) => {
      const label = value ?? fallback;
      const key = `${week ?? ""}|${value ? "v" : "f"}|${label}`;
      let row = out.get(key);
      if (!row) {
        row = {
          key,
          label,
          sub: value ? sub : "No ad tag",
          week,
          funnels: new Map(),
          spend: 0,
          visits: null,
          leads: 0,
          qualified: 0,
          accounts: 0,
          trials: 0,
          paid: 0,
          rev90: 0,
          hoursToTrial: [],
        };
        out.set(key, row);
      }
      return row;
    };

    for (const lead of leads) {
      if (lead.source === "ash" || lead.leadAt < since) continue;
      const value = groupValue(group, lead);
      const funnel = SOURCE_LABELS[lead.source] ?? lead.source;
      const row = rowFor(value, funnel, byWeek ? weekOf(lead.leadAt) : null, group === "ad" || group === "adAdset" ? lead.campaign : null);
      row.funnels.set(funnel, (row.funnels.get(funnel) ?? 0) + 1);
      row.leads += 1;
      if (lead.score >= QUALIFIED_SCORE) row.qualified += 1;
      if (lead.registeredAt || STAGE_RANK[lead.stage] >= STAGE_RANK.registered) row.accounts += 1;
      if (lead.trialStartedAt || lead.stage === "trial" || lead.stage === "customer") row.trials += 1;
      // Only money that started after this lead arrived belongs to the
      // experiment; an existing customer filling a form again is not a win.
      const firstPaid = lead.ltv?.firstPaidAt ? new Date(lead.ltv.firstPaidAt).getTime() : 0;
      if (lead.ltv && firstPaid >= new Date(lead.leadAt).getTime() - 2 * DAY_MS) {
        row.paid += 1;
        row.rev90 += lead.ltv.paid90;
      }
      if (lead.trialStartedAt) {
        const hours = (new Date(lead.trialStartedAt).getTime() - new Date(lead.leadAt).getTime()) / 3_600_000;
        if (hours >= 0) row.hoursToTrial.push(hours);
      }
    }

    for (const s of spend?.rows ?? []) {
      const value = groupValue(group, { campaign: norm(s.campaignName), ad: norm(s.adName), adset: norm(s.adsetName) });
      const row = rowFor(value, "Meta, untagged", byWeek ? weekOf(s.date) : null, group === "ad" || group === "adAdset" ? norm(s.campaignName) : null);
      row.spend += s.spend;
    }

    // Visits are counted per ad and per campaign, so they exist for those groupings.
    for (const d of traffic ?? []) {
      const week = byWeek ? weekOf(d.day) : null;
      const counted = group === "campaign" ? d.campaigns : group === "ad" || group === "angle" ? d.ads : undefined;
      for (const [name, c] of Object.entries(counted ?? {})) {
        const value = group === "angle" ? parseAngle(name) : name;
        if (!value) continue;
        const row = out.get(`${week ?? ""}|v|${value}`);
        if (row) row.visits = (row.visits ?? 0) + (c.sessions ?? 0);
      }
    }

    const roas = (r: Row) => (r.spend > 0 ? r.rev90 / r.spend : -1);
    const costPaid = (r: Row) => (r.paid > 0 && r.spend > 0 ? r.spend / r.paid : Number.POSITIVE_INFINITY);
    const value = (r: Row): number =>
      sort === "roas" ? roas(r) : sort === "costPaid" ? -costPaid(r) : (r[sort] as number);
    return [...out.values()].sort(
      (a, b) => (byWeek ? (b.week ?? "").localeCompare(a.week ?? "") : 0) || value(b) - value(a) || b.leads - a.leads,
    );
  }, [leads, since, group, byWeek, spend, traffic, sort]);

  const totals = useMemo(() => {
    const t = { spend: 0, leads: 0, trials: 0, paid: 0, rev90: 0 };
    for (const r of rows) {
      t.spend += r.spend;
      t.leads += r.leads;
      t.trials += r.trials;
      t.paid += r.paid;
      t.rev90 += r.rev90;
    }
    return t;
  }, [rows]);

  // When Meta's numbers are missing, the hand-kept monthly Facebook total,
  // spread evenly over its month, still gives an overall cost per trial.
  const manualFacebook = useMemo(() => {
    if (!spend || spend.rows.length > 0) return null;
    let total = 0;
    for (let t = Date.now() - days * DAY_MS; t < Date.now(); t += DAY_MS) {
      const d = new Date(t);
      const month = spend.manual.months[d.toISOString().slice(0, 7)];
      const daysInMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
      if (month?.facebook) total += month.facebook / daysInMonth;
    }
    const fbLeads = leads.filter((l) => l.leadAt >= since && (l.source === "facebook-form" || l.source === "facebook-web"));
    const trials = fbLeads.filter((l) => l.trialStartedAt || l.stage === "trial" || l.stage === "customer").length;
    const paid = fbLeads.filter(
      (l) => l.ltv?.firstPaidAt && new Date(l.ltv.firstPaidAt).getTime() >= new Date(l.leadAt).getTime() - 2 * DAY_MS,
    ).length;
    return { total, trials, paid };
  }, [spend, days, leads, since]);

  const header = (key: SortKey, label: string) => (
    <th>
      <button type="button" className="ld-exp-sort" data-active={sort === key} onClick={() => setSort(key)}>
        {label}
      </button>
    </th>
  );

  return (
    <div className="ld-traffic ld-exp">
      <div className="ld-traffic-head">
        <div className="ld-live-switch" role="tablist" aria-label="Group by">
          {GROUPS.map((g) => (
            <button key={g.value} type="button" role="tab" aria-selected={group === g.value} onClick={() => setGroup(g.value)}>
              {g.label}
            </button>
          ))}
        </div>
        <div className="ld-traffic-controls">
          <span className="ld-toggle-label" role="switch" aria-checked={byWeek} onClick={() => setByWeek((v) => !v)}>
            <span className="ld-switch" data-on={byWeek} />
            By week
          </span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Range">
            {RANGES.map((r) => (
              <option key={r} value={r}>
                Last {r} days
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="ld-banner ld-banner-error">{error}</div>}
      {spend?.error && (
        <div className="ld-banner ld-banner-warning">
          Meta spend isn&apos;t connected ({spend.error}), so the cost columns are empty.
          {manualFacebook && manualFacebook.total > 0 && (
            <>
              {" "}
              From the monthly totals: about {money(manualFacebook.total)} on Facebook in this range,{" "}
              {per(manualFacebook.total, manualFacebook.trials)} per trial and {per(manualFacebook.total, manualFacebook.paid)} per
              paying customer.
            </>
          )}
        </div>
      )}

      <div className="ld-exp-kpis">
        <div>
          <span>Spend</span>
          <b>{totals.spend > 0 ? money(totals.spend) : "–"}</b>
        </div>
        <div>
          <span>Leads</span>
          <b>{totals.leads}</b>
        </div>
        <div>
          <span>Trials</span>
          <b>{totals.trials}</b>
        </div>
        <div>
          <span>Paying</span>
          <b>{totals.paid}</b>
        </div>
        <div>
          <span>Cost per paying</span>
          <b>{per(totals.spend, totals.paid)}</b>
        </div>
        <div>
          <span>90-day revenue per $1</span>
          <b>{totals.spend > 0 ? `$${(totals.rev90 / totals.spend).toFixed(2)}` : "–"}</b>
        </div>
      </div>

      <section className="ld-live-block ld-exp-block">
        {rows.length === 0 ? (
          <p className="ld-live-empty">No leads or spend in this range.</p>
        ) : (
          <div className="ld-exp-scroll">
            <table className="ld-app-table ld-exp-table">
              <thead>
                <tr>
                  {byWeek && <th>Week of</th>}
                  <th>{GROUPS.find((g) => g.value === group)?.label}</th>
                  <th>Funnel</th>
                  {header("spend", "Spend")}
                  <th>Visits</th>
                  {header("leads", "Leads")}
                  <th>Qualified</th>
                  <th>Accounts</th>
                  {header("trials", "Trials")}
                  {header("paid", "Paying")}
                  <th>Per trial</th>
                  {header("costPaid", "Per paying")}
                  <th>Lead → trial</th>
                  {header("rev90", "90-day revenue")}
                  {header("roas", "Per $1")}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const funnel = [...r.funnels.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Meta";
                  return (
                    <tr key={r.key} data-untagged={r.sub === "No ad tag" || undefined}>
                      {byWeek && <td className="ld-exp-week">{r.week}</td>}
                      <td className="ld-exp-name">
                        <b>{r.label}</b>
                        {r.sub && <small>{r.sub}</small>}
                      </td>
                      <td>{funnel}</td>
                      <td>{r.spend > 0 ? money(r.spend) : "–"}</td>
                      <td>{r.visits ?? "–"}</td>
                      <td>{r.leads}</td>
                      <td>{pctOf(r.qualified, r.leads)}</td>
                      <td>{r.accounts}</td>
                      <td>{r.trials}</td>
                      <td>
                        <b>{r.paid}</b>
                      </td>
                      <td>{per(r.spend, r.trials)}</td>
                      <td>{per(r.spend, r.paid)}</td>
                      <td>{duration(median(r.hoursToTrial))}</td>
                      <td>{r.rev90 > 0 ? money(r.rev90) : "–"}</td>
                      <td>{r.spend > 0 ? `$${(r.rev90 / r.spend).toFixed(2)}` : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
