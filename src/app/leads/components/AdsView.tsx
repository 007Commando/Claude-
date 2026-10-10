"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Play, RefreshCw, Star } from "lucide-react";
import { type Lead, isHotLead } from "../../../lib/leads/model";
import type { MetaAd, MetaAdsPayload, MetaAdset, MetaCampaign } from "../../../lib/leads/metaAds";
import { STAGE_LABELS, promotionOf, stageOf, type FunnelStage } from "../../../lib/leads/adGroups";
import { apiUrl } from "./shared";

/**
 * Facebook ads (Stefano, 2026-10-08), replacing Experiments. The point is to see
 * the content that's actually out there, picture or video, grouped by what each
 * campaign is for, and read every ad by what its leads went on to do: accounts,
 * trials, paying customers, money in, and gold-star leads ($10k+ for inventory).
 * An ad with dear leads that turn into customers beats one with cheap leads that
 * don't, and this is where the media buyers see that before placing next week's bets.
 *
 * Meta supplies the creatives and delivery (spend, impressions, clicks). Every
 * lead is matched to its ad by Meta ad id (instant forms, from GHL's attribution)
 * or by the ad and campaign names in its utm tags (website funnels).
 */

/** Today, yesterday, rolling windows, or a calendar range. Days are New York days, the ad account's. */
type Preset = "today" | "yesterday" | "7" | "14" | "30" | "90" | "custom";
const PRESETS: [Preset, string][] = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["7", "7 days"],
  ["14", "14 days"],
  ["30", "30 days"],
  ["90", "90 days"],
  ["custom", "Pick dates"],
];
const DAY_MS = 86_400_000;
const nyDay = (d: Date | string | number) => new Date(d).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

function rangeOf(preset: Preset, custom: { since: string; until: string }): { since: string; until: string } {
  const today = nyDay(Date.now());
  if (preset === "today") return { since: today, until: today };
  if (preset === "yesterday") {
    const y = nyDay(Date.now() - DAY_MS);
    return { since: y, until: y };
  }
  if (preset === "custom") return custom.since <= custom.until ? custom : { since: custom.until, until: custom.since };
  return { since: nyDay(Date.now() - (Number(preset) - 1) * DAY_MS), until: today };
}

/**
 * Website tags that name a Meta campaign under an older label: the link's
 * utm_campaign was set when the campaign had another name and never changed.
 * Keyed by the normalised tag, valued by the Meta campaign id.
 */
const CAMPAIGN_ALIASES: Record<string, string> = {
  "apex pop promotion web": "120249105938920366", // Apex Pop Promotion - Website (A/B)
  "free va 14 days nq": "120249049706090366", // Apex Free VA 14 days - Leads
};

/** Campaign and ad names as both sides spell them: "apex-pop-promotion" and "Apex Pop Promotion" are one. */
const norm = (s: string | null | undefined) =>
  (s ?? "")
    .toLowerCase()
    .replace(/[-_/()|·:,&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
type GroupBy = "promotion" | "stage" | "campaign";
type AdSort = "revenue" | "roas" | "paying" | "leads" | "cpl" | "spend";

interface Tally {
  spend: number;
  impressions: number;
  clicks: number;
  /** Leads Meta says the ads produced (its own count, before anything reaches the CRM). */
  metaLeads: number;
  leads: number;
  hot: number;
  accounts: number;
  trials: number;
  paying: number;
  revenue: number;
}

const zero = (): Tally => ({ spend: 0, impressions: 0, clicks: 0, metaLeads: 0, leads: 0, hot: 0, accounts: 0, trials: 0, paying: 0, revenue: 0 });

function add(t: Tally, o: Tally) {
  for (const k of Object.keys(t) as (keyof Tally)[]) t[k] += o[k];
}

/** One lead's contribution. Money only counts if it started after the lead arrived. */
function leadTally(l: Lead): Tally {
  const t = zero();
  t.leads = 1;
  if (isHotLead(l)) t.hot = 1;
  if (l.registeredAt || l.stage !== "lead") t.accounts = 1;
  if (l.trialStartedAt || l.stage === "trial" || l.stage === "customer") t.trials = 1;
  const firstPaid = l.ltv?.firstPaidAt ? new Date(l.ltv.firstPaidAt).getTime() : 0;
  if (l.ltv && firstPaid >= new Date(l.leadAt).getTime() - 2 * DAY_MS) {
    t.paying = 1;
    t.revenue = l.ltv.totalPaid;
  }
  return t;
}

/* ---------------------------------------------------------------- formatting */

const usd = (n: number, dp = 0) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: dp, maximumFractionDigits: dp });
const cost = (spend: number, n: number) => (spend > 0 && n > 0 ? usd(spend / n, spend / n < 100 ? 2 : 0) : "–");
const cpm = (t: Tally) => (t.impressions > 0 ? usd((t.spend / t.impressions) * 1000, 2) : "–");
const ctr = (t: Tally) => (t.impressions > 0 ? `${((t.clicks / t.impressions) * 100).toFixed(2)}%` : "–");
const roas = (t: Tally) => (t.spend > 0 && t.revenue > 0 ? `${(t.revenue / t.spend).toFixed(2)}x` : t.spend > 0 ? "0x" : "–");
const int = (n: number) => n.toLocaleString("en-US");

function statusOf(raw: string): { label: string; tone: "on" | "off" | "warn" } {
  const s = raw.toUpperCase();
  if (s === "ACTIVE") return { label: "Active", tone: "on" };
  if (s.includes("PAUSED")) return { label: "Paused", tone: "off" };
  if (s === "ARCHIVED" || s === "DELETED") return { label: "Archived", tone: "off" };
  if (s === "DISAPPROVED" || s === "WITH_ISSUES") return { label: s === "DISAPPROVED" ? "Rejected" : "Issues", tone: "warn" };
  if (s === "IN_PROCESS" || s === "PENDING_REVIEW" || s === "PREAPPROVED") return { label: "In review", tone: "warn" };
  if (s === "CRM") return { label: "From CRM", tone: "off" };
  return { label: raw ? raw.charAt(0) + raw.slice(1).toLowerCase() : "Unknown", tone: "off" };
}

const OBJECTIVES: Record<string, string> = {
  OUTCOME_LEADS: "Leads",
  OUTCOME_TRAFFIC: "Traffic",
  OUTCOME_SALES: "Sales",
  OUTCOME_ENGAGEMENT: "Engagement",
  OUTCOME_AWARENESS: "Awareness",
  OUTCOME_APP_PROMOTION: "App promotion",
  LEAD_GENERATION: "Leads",
  CONVERSIONS: "Conversions",
  LINK_CLICKS: "Traffic",
};

function domainOf(link: string | null): string | null {
  if (!link) return null;
  try {
    return new URL(link).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- the view */

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  promotion: string;
  stage: FunnelStage;
  budget: number | null;
  meta: MetaCampaign | null;
  tally: Tally;
}

/** "2h ago", "35 min ago": how old the connector snapshot is. */
function snapshotAgo(iso: string | null | undefined): string {
  if (!iso) return "at an unknown time";
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)} days ago`;
}

export default function AdsView({ leads }: { leads: Lead[] }) {
  const [preset, setPreset] = useState<Preset>("30");
  const [custom, setCustom] = useState(() => ({ since: nyDay(Date.now() - 6 * DAY_MS), until: nyDay(Date.now()) }));
  const range = useMemo(() => rangeOf(preset, custom), [preset, custom]);
  const [data, setData] = useState<MetaAdsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("promotion");
  const [selected, setSelected] = useState<string | null>(null);
  const [format, setFormat] = useState<"all" | "image" | "video">("all");
  const [adSort, setAdSort] = useState<AdSort>("revenue");

  const load = useCallback(
    async (fresh = false) => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/api/leads/ads?since=${range.since}&until=${range.until}${fresh ? "&fresh=1" : ""}`), { cache: "no-store" });
        setData((await res.json()) as MetaAdsPayload);
      } catch (e) {
        setData({ since: "", until: "", campaigns: [], adsets: [], ads: [], error: e instanceof Error ? e.message : String(e) });
      } finally {
        setLoading(false);
      }
    },
    [range.since, range.until],
  );

  useEffect(() => {
    load();
  }, [load]);


  const model = useMemo(() => {
    const ads = data?.ads ?? [];
    const metaCampaigns = data?.campaigns ?? [];
    const adsets = data?.adsets ?? [];
    const adById = new Map(ads.map((a) => [a.id, a]));
    const campaignById = new Map(metaCampaigns.map((c) => [c.id, c]));
    const adsByName = new Map<string, MetaAd[]>();
    for (const a of ads) adsByName.set(norm(a.name), [...(adsByName.get(norm(a.name)) ?? []), a]);
    const campaignByName = new Map(metaCampaigns.map((c) => [norm(c.name), c]));

    // The Facebook leads of the period, each matched to its Meta ad where possible.
    const fbLeads = leads.filter(
      (l) => {
        if (l.internal || !(l.source === "facebook-form" || l.source === "facebook-web" || Boolean(l.adId))) return false;
        const day = nyDay(l.leadAt);
        return day >= range.since && day <= range.until;
      },
    );
    const adTally = new Map<string, Tally>();
    const campaignKeyOfLead = new Map<string, string>();
    const unmatched = new Map<string, Tally>();
    for (const l of fbLeads) {
      let ad: MetaAd | undefined = l.adId ? adById.get(l.adId) : undefined;
      if (!ad && l.ad) {
        const named = adsByName.get(norm(l.ad)) ?? [];
        ad = named.find((a) => norm(campaignById.get(a.campaignId)?.name) === norm(l.campaign)) ?? (named.length === 1 ? named[0] : undefined);
      }
      const t = leadTally(l);
      if (ad) {
        const at = adTally.get(ad.id) ?? zero();
        add(at, t);
        adTally.set(ad.id, at);
        campaignKeyOfLead.set(l.id, ad.campaignId);
        continue;
      }
      const camp =
        (l.campaignId && campaignById.get(l.campaignId)) ||
        (l.campaign ? (campaignByName.get(norm(l.campaign)) ?? campaignById.get(CAMPAIGN_ALIASES[norm(l.campaign)] ?? "")) : undefined);
      // Leads with a campaign Meta no longer lists still get a campaign card, from the CRM side.
      const key = camp ? camp.id : l.campaign ? `crm:${l.campaign}` : "crm:none";
      campaignKeyOfLead.set(l.id, key);
      const label = l.campaign ? `${l.campaign}${l.ad ? ` · ${l.ad}` : ""}` : "No ad recorded";
      const ut = unmatched.get(label) ?? zero();
      add(ut, t);
      unmatched.set(label, ut);
    }

    // Delivery into each ad's tally.
    for (const a of ads) {
      const t = adTally.get(a.id) ?? zero();
      t.spend += a.delivery.spend;
      t.impressions += a.delivery.impressions;
      t.clicks += a.delivery.clicks;
      t.metaLeads += a.delivery.metaLeads;
      adTally.set(a.id, t);
    }

    // Campaigns: Meta's, plus CRM-only names that leads carry.
    const campaigns = new Map<string, CampaignRow>();
    const budgetOf = (c: MetaCampaign) => {
      if (c.dailyBudget) return c.dailyBudget;
      const sets = adsets.filter((s) => s.campaignId === c.id && s.status.toUpperCase() === "ACTIVE" && s.dailyBudget);
      return sets.length ? sets.reduce((m, s) => m + (s.dailyBudget ?? 0), 0) : null;
    };
    for (const c of metaCampaigns) {
      campaigns.set(c.id, { id: c.id, name: c.name, status: c.status, promotion: promotionOf(c.id, c.name), stage: stageOf(c.id, c.name), budget: budgetOf(c), meta: c, tally: zero() });
    }
    for (const a of ads) {
      const row = campaigns.get(a.campaignId);
      if (row) add(row.tally, adTally.get(a.id) ?? zero());
    }
    for (const l of fbLeads) {
      const key = campaignKeyOfLead.get(l.id);
      if (!key || !key.startsWith("crm:")) continue;
      const name = key === "crm:none" ? "No campaign recorded" : key.slice(4);
      const row = campaigns.get(key) ?? { id: key, name, status: "CRM", promotion: promotionOf(null, name), stage: stageOf(null, name), budget: null, meta: null, tally: zero() };
      add(row.tally, leadTally(l));
      campaigns.set(key, row);
    }
    const campaignList = [...campaigns.values()]
      .filter((c) => c.tally.spend > 0 || c.tally.leads > 0 || c.status.toUpperCase() === "ACTIVE")
      .sort((a, b) => Number(b.status.toUpperCase() === "ACTIVE") - Number(a.status.toUpperCase() === "ACTIVE") || b.tally.spend - a.tally.spend || b.tally.leads - a.tally.leads);

    return { ads, adsets, adTally, campaignList, unmatched, fbCount: fbLeads.length };
  }, [data, leads, range.since, range.until]);

  const selectedCampaign = model.campaignList.find((c) => c.id === selected) ?? null;
  const scopeTally = useMemo(() => {
    const t = zero();
    for (const c of model.campaignList) if (!selected || c.id === selected) add(t, c.tally);
    return t;
  }, [model.campaignList, selected]);

  /** Every campaign that spent or brought a lead in the period, most spend first, with a total. */
  const costRows = useMemo(() => {
    const rows = model.campaignList
      .filter((c) => c.tally.spend > 0 || c.tally.leads > 0)
      .sort((a, b) => b.tally.spend - a.tally.spend || b.tally.leads - a.tally.leads);
    const total = zero();
    for (const c of rows) add(total, c.tally);
    return { rows, total };
  }, [model.campaignList]);

  const scoreboard = useMemo(() => {
    const groups = new Map<string, { label: string; sub: string | null; tally: Tally }>();
    for (const c of model.campaignList) {
      const key = groupBy === "promotion" ? c.promotion : groupBy === "stage" ? c.stage : c.id;
      const label = groupBy === "promotion" ? c.promotion : groupBy === "stage" ? STAGE_LABELS[c.stage] : c.name;
      const sub = groupBy === "campaign" ? `${c.promotion} · ${STAGE_LABELS[c.stage]}` : null;
      const g = groups.get(key) ?? { label, sub, tally: zero() };
      add(g.tally, c.tally);
      groups.set(key, g);
    }
    const rows = [...groups.values()].sort((a, b) => b.tally.revenue - a.tally.revenue || b.tally.paying - a.tally.paying || b.tally.spend - a.tally.spend);
    // Two flags worth acting on: the best return on spend, and the cheapest paying customer.
    const withSpend = rows.filter((r) => r.tally.spend > 0);
    const bestRoas = withSpend.filter((r) => r.tally.revenue > 0).sort((a, b) => b.tally.revenue / b.tally.spend - a.tally.revenue / a.tally.spend)[0];
    const cheapestPaying = withSpend.filter((r) => r.tally.paying > 0).sort((a, b) => a.tally.spend / a.tally.paying - b.tally.spend / b.tally.paying)[0];
    const cheapestStar = withSpend.filter((r) => r.tally.hot > 0).sort((a, b) => a.tally.spend / a.tally.hot - b.tally.spend / b.tally.hot)[0];
    return { rows, bestRoas, cheapestPaying, cheapestStar };
  }, [model.campaignList, groupBy]);

  const visibleAds = useMemo(() => {
    const sortVal = (a: MetaAd) => {
      const t = model.adTally.get(a.id) ?? zero();
      switch (adSort) {
        case "revenue":
          return t.revenue * 1e6 + t.paying * 1e3 + t.leads;
        case "roas":
          return t.spend > 0 ? t.revenue / t.spend : -1;
        case "paying":
          return t.paying * 1e3 + t.trials;
        case "leads":
          return t.leads;
        case "cpl":
          return t.leads > 0 ? -(t.spend / t.leads) : -1e9;
        case "spend":
          return t.spend;
      }
    };
    return model.ads
      .filter((a) => !selected || a.campaignId === selected)
      .filter((a) => format === "all" || (format === "video" ? a.creative.format === "video" : a.creative.format !== "video"))
      .filter((a) => {
        const t = model.adTally.get(a.id);
        return a.status.toUpperCase() === "ACTIVE" || (t && (t.spend > 0 || t.leads > 0));
      })
      .sort((a, b) => sortVal(b) - sortVal(a));
  }, [model, selected, format, adSort]);

  const adsetsOf = (campaignId: string): MetaAdset[] => model.adsets.filter((s) => s.campaignId === campaignId);
  const metaDown = Boolean(data?.error);

  return (
    <div className="ld-ads">
      <div className="ld-ads-head">
        <div className="ld-view-switch" role="tablist" aria-label="Period">
          {PRESETS.map(([value, label]) => (
            <button key={value} type="button" data-active={preset === value} onClick={() => setPreset(value)}>
              {label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="ld-ads-dates">
            <label>
              From
              <input
                id="ads-range-since"
                type="date"
                value={custom.since}
                max={nyDay(Date.now())}
                onChange={(e) => e.target.value && setCustom((c) => ({ ...c, since: e.target.value }))}
              />
            </label>
            <label>
              To
              <input
                id="ads-range-until"
                type="date"
                value={custom.until}
                max={nyDay(Date.now())}
                onChange={(e) => e.target.value && setCustom((c) => ({ ...c, until: e.target.value }))}
              />
            </label>
          </div>
        )}
        <span className="ld-ads-meta">
          {model.fbCount} Facebook leads in the period{data && !metaDown ? ` · ${model.ads.length} ads from Meta` : ""}
        </span>
        <button type="button" className="ld-btn" onClick={() => load(true)} disabled={loading}>
          <RefreshCw size={13} className={loading ? "ld-spin" : undefined} /> Refresh
        </button>
      </div>

      {data?.source === "snapshot" && (
        <p className="ld-ads-note">
          Meta numbers come from the Meta connector, refreshed {snapshotAgo(data.snapshotAt)}. They update a few times a day until Meta
          gives the site its own token.
        </p>
      )}

      {metaDown && (
        <div className="ld-ads-banner">
          <strong>Meta isn&apos;t connected, so spend, CPM and the ad creatives are missing.</strong> Leads, gold stars, accounts, trials and
          revenue below come from the CRM and are real. Meta said: {data?.error}
        </div>
      )}

      {/* True cost per lead, campaign by campaign */}
      <section className="ld-ads-card">
        <div className="ld-ads-card-head">
          <h2>Cost per lead by campaign</h2>
          <span className="ld-ads-meta">
            {range.since === range.until ? range.since : `${range.since} to ${range.until}`} · true cost = spend ÷ leads that reached the CRM
          </span>
        </div>
        <div className="ld-ads-table-wrap">
          <table className="ld-ads-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Spend</th>
                <th title="Leads Meta counted">Meta leads</th>
                <th title="Spend ÷ the leads Meta counted">Meta&apos;s cost / lead</th>
                <th title="Leads that arrived in the CRM">Leads in CRM</th>
                <th title="Spend ÷ leads that arrived in the CRM">True cost / lead</th>
                <th>Accounts</th>
                <th>Cost / account</th>
                <th>Paying</th>
                <th>Cost / paying</th>
              </tr>
            </thead>
            <tbody>
              {costRows.rows.map((c) => {
                const st = statusOf(c.status);
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="ld-ads-rowname">{c.name}</span>
                      <span className="ld-ads-rowsub">
                        <span className="ld-ads-status" data-tone={st.tone}>
                          {st.label}
                        </span>{" "}
                        {c.promotion}
                      </span>
                    </td>
                    <td>{c.tally.spend ? usd(c.tally.spend) : "–"}</td>
                    <td>{c.tally.metaLeads ? int(c.tally.metaLeads) : "–"}</td>
                    <td>{cost(c.tally.spend, c.tally.metaLeads)}</td>
                    <td>{int(c.tally.leads)}</td>
                    <td className="ld-ads-strong">{cost(c.tally.spend, c.tally.leads)}</td>
                    <td>{int(c.tally.accounts)}</td>
                    <td>{cost(c.tally.spend, c.tally.accounts)}</td>
                    <td>{int(c.tally.paying)}</td>
                    <td>{cost(c.tally.spend, c.tally.paying)}</td>
                  </tr>
                );
              })}
              {costRows.rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="ld-ads-empty">
                    No spend or Facebook leads in this period.
                  </td>
                </tr>
              ) : (
                <tr className="ld-ads-total">
                  <td>
                    <span className="ld-ads-rowname">All campaigns</span>
                  </td>
                  <td>{costRows.total.spend ? usd(costRows.total.spend) : "–"}</td>
                  <td>{costRows.total.metaLeads ? int(costRows.total.metaLeads) : "–"}</td>
                  <td>{cost(costRows.total.spend, costRows.total.metaLeads)}</td>
                  <td>{int(costRows.total.leads)}</td>
                  <td className="ld-ads-strong">{cost(costRows.total.spend, costRows.total.leads)}</td>
                  <td>{int(costRows.total.accounts)}</td>
                  <td>{cost(costRows.total.spend, costRows.total.accounts)}</td>
                  <td>{int(costRows.total.paying)}</td>
                  <td>{cost(costRows.total.spend, costRows.total.paying)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Where to double down */}
      <section className="ld-ads-card">
        <div className="ld-ads-card-head">
          <h2>Where to double down</h2>
          <div className="ld-view-switch" role="tablist" aria-label="Compare by">
            {(
              [
                ["promotion", "Promotion"],
                ["stage", "Funnel stage"],
                ["campaign", "Campaign"],
              ] as [GroupBy, string][]
            ).map(([v, label]) => (
              <button key={v} type="button" data-active={groupBy === v} onClick={() => setGroupBy(v)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="ld-ads-table-wrap">
          <table className="ld-ads-table">
            <thead>
              <tr>
                <th>{groupBy === "promotion" ? "Promotion" : groupBy === "stage" ? "Funnel stage" : "Campaign"}</th>
                <th>Spend</th>
                <th>CPM</th>
                <th>Leads</th>
                <th>Cost / lead</th>
                <th title="$10k+ for inventory">Gold stars</th>
                <th>Cost / star</th>
                <th>Accounts</th>
                <th>Trials</th>
                <th>Paying</th>
                <th>Cost / paying</th>
                <th>Revenue</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {scoreboard.rows.map((r) => (
                <tr key={r.label}>
                  <td>
                    <span className="ld-ads-rowname">{r.label}</span>
                    {r.sub && <span className="ld-ads-rowsub">{r.sub}</span>}
                    {r === scoreboard.bestRoas && <span className="ld-ads-flag ld-ads-flag-good">Best return</span>}
                    {r === scoreboard.cheapestPaying && <span className="ld-ads-flag ld-ads-flag-good">Cheapest customer</span>}
                    {r === scoreboard.cheapestStar && <span className="ld-ads-flag">Cheapest gold star</span>}
                  </td>
                  <td>{r.tally.spend ? usd(r.tally.spend) : "–"}</td>
                  <td>{cpm(r.tally)}</td>
                  <td>{int(r.tally.leads)}</td>
                  <td>{cost(r.tally.spend, r.tally.leads)}</td>
                  <td>{r.tally.hot ? int(r.tally.hot) : "–"}</td>
                  <td>{cost(r.tally.spend, r.tally.hot)}</td>
                  <td>{int(r.tally.accounts)}</td>
                  <td>{int(r.tally.trials)}</td>
                  <td>{int(r.tally.paying)}</td>
                  <td>{cost(r.tally.spend, r.tally.paying)}</td>
                  <td>{r.tally.revenue ? usd(r.tally.revenue) : "–"}</td>
                  <td>{roas(r.tally)}</td>
                </tr>
              ))}
              {scoreboard.rows.length === 0 && (
                <tr>
                  <td colSpan={13} className="ld-ads-empty">
                    No Facebook leads or spend in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Campaign cards */}
      <div className="ld-ads-campaigns">
        <button type="button" className="ld-ads-camp" data-active={selected === null} onClick={() => setSelected(null)}>
          <span className="ld-ads-camp-name">All campaigns</span>
          <span className="ld-ads-camp-sub">
            {scopeTally.spend && !selected ? `${usd(scopeTally.spend)} spent · ` : ""}
            {int(model.campaignList.reduce((m, c) => m + c.tally.leads, 0))} leads
          </span>
        </button>
        {model.campaignList.map((c) => {
          const st = statusOf(c.status);
          return (
            <button key={c.id} type="button" className="ld-ads-camp" data-active={selected === c.id} onClick={() => setSelected(c.id)}>
              <span className="ld-ads-camp-top">
                <span className="ld-ads-camp-name">{c.name}</span>
                <span className="ld-ads-status" data-tone={st.tone}>
                  {st.label}
                </span>
              </span>
              <span className="ld-ads-camp-sub">
                {c.promotion} · {STAGE_LABELS[c.stage]}
              </span>
              <span className="ld-ads-camp-sub">
                {c.budget ? `${usd(c.budget)}/day · ` : ""}
                {int(c.tally.leads)} leads{c.tally.paying ? ` · ${c.tally.paying} paying` : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* KPI tiles for the selected scope */}
      <div className="ld-ads-kpis">
        <Kpi label="Spent" value={scopeTally.spend ? usd(scopeTally.spend) : "–"} sub={`${int(scopeTally.impressions)} impressions`} />
        <Kpi label="CPM" value={cpm(scopeTally)} sub={`CTR ${ctr(scopeTally)}`} />
        <Kpi label="Leads" value={int(scopeTally.leads)} sub={`${cost(scopeTally.spend, scopeTally.leads)} per lead`} />
        <Kpi label="Gold stars" value={int(scopeTally.hot)} sub={`${cost(scopeTally.spend, scopeTally.hot)} each · $10k+ budget`} />
        <Kpi label="Accounts" value={int(scopeTally.accounts)} sub={`${cost(scopeTally.spend, scopeTally.accounts)} each`} />
        <Kpi label="Trials" value={int(scopeTally.trials)} sub={`${cost(scopeTally.spend, scopeTally.trials)} each`} />
        <Kpi label="Paying" value={int(scopeTally.paying)} sub={`${cost(scopeTally.spend, scopeTally.paying)} each`} />
        <Kpi label="Revenue" value={scopeTally.revenue ? usd(scopeTally.revenue) : "$0"} sub={`ROAS ${roas(scopeTally)}`} />
      </div>

      <div className={`ld-ads-body${selectedCampaign ? " ld-ads-body-split" : ""}`}>
        <section className="ld-ads-card">
          <div className="ld-ads-card-head">
            <h2>Ads ({visibleAds.length})</h2>
            <div className="ld-ads-tools">
              <div className="ld-view-switch" role="tablist" aria-label="Format">
                {(
                  [
                    ["all", "All"],
                    ["image", "Pictures"],
                    ["video", "Videos"],
                  ] as ["all" | "image" | "video", string][]
                ).map(([v, label]) => (
                  <button key={v} type="button" data-active={format === v} onClick={() => setFormat(v)}>
                    {label}
                  </button>
                ))}
              </div>
              <label className="ld-ads-sort">
                Sort
                <select value={adSort} onChange={(e) => setAdSort(e.target.value as AdSort)}>
                  <option value="revenue">Revenue</option>
                  <option value="roas">ROAS</option>
                  <option value="paying">Paying customers</option>
                  <option value="leads">Leads</option>
                  <option value="cpl">Cheapest lead</option>
                  <option value="spend">Spend</option>
                </select>
              </label>
            </div>
          </div>
          {visibleAds.length === 0 ? (
            <p className="ld-ads-empty">
              {metaDown ? "The ads themselves appear once Meta is connected. The table above already counts their leads." : "No ads with spend or leads in this period."}
            </p>
          ) : (
            <div className="ld-ads-grid">
              {visibleAds.map((a) => (
                <AdCard key={a.id} ad={a} tally={model.adTally.get(a.id) ?? zero()} />
              ))}
            </div>
          )}
        </section>

        {selectedCampaign && <CampaignPanel c={selectedCampaign} adsets={adsetsOf(selectedCampaign.id)} />}
      </div>

      {model.unmatched.size > 0 && (
        <section className="ld-ads-card">
          <div className="ld-ads-card-head">
            <h2>Leads not matched to a Meta ad</h2>
            <span className="ld-ads-meta">Counted in their campaign above. Usually an ad renamed or deleted since, or a link without the ad tags.</span>
          </div>
          <div className="ld-ads-table-wrap">
            <table className="ld-ads-table">
              <thead>
                <tr>
                  <th>Campaign · ad, as the lead recorded it</th>
                  <th>Leads</th>
                  <th>Gold stars</th>
                  <th>Accounts</th>
                  <th>Trials</th>
                  <th>Paying</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[...model.unmatched.entries()]
                  .sort((a, b) => b[1].leads - a[1].leads)
                  .map(([label, t]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{t.leads}</td>
                      <td>{t.hot || "–"}</td>
                      <td>{t.accounts}</td>
                      <td>{t.trials}</td>
                      <td>{t.paying}</td>
                      <td>{t.revenue ? usd(t.revenue) : "–"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="ld-ads-kpi">
      <span className="ld-ads-kpi-label">{label}</span>
      <span className="ld-ads-kpi-value">{value}</span>
      <span className="ld-ads-kpi-sub">{sub}</span>
    </div>
  );
}

/** The ad as it shows in the Facebook feed, with what it did underneath. */
function AdCard({ ad, tally }: { ad: MetaAd; tally: Tally }) {
  const c = ad.creative;
  const st = statusOf(ad.status);
  const domain = domainOf(c.link);
  return (
    <article className="ld-ad">
      <div className="ld-ad-preview">
        <div className="ld-ad-page">
          {c.pagePicture ? <img src={c.pagePicture} alt="" /> : <span className="ld-ad-page-dot" aria-hidden="true" />}
          <span>
            <strong>{c.pageName ?? "Apex Applications"}</strong>
            <small>Sponsored</small>
          </span>
        </div>
        {c.body && <p className="ld-ad-body">{c.body}</p>}
        <div className="ld-ad-media">
          {c.imageUrl ? <img src={c.imageUrl} alt="" loading="lazy" /> : <span className="ld-ad-media-empty">No preview</span>}
          {c.format === "video" && (
            <span className="ld-ad-play" aria-label="Video ad">
              <Play size={18} fill="currentColor" />
            </span>
          )}
          <span className="ld-ad-format">
            {c.format === "video" ? <Play size={10} /> : <ImageIcon size={10} />} {c.format === "unknown" ? "Ad" : c.format === "video" ? "Video" : c.format === "carousel" ? "Carousel" : "Picture"}
          </span>
        </div>
        {(c.headline || domain || c.cta) && (
          <div className="ld-ad-linkbar">
            <span className="ld-ad-linktext">
              {domain && <small>{domain}</small>}
              {c.headline && <strong>{c.headline}</strong>}
              {c.description && <em>{c.description}</em>}
            </span>
            {c.cta && <span className="ld-ad-cta">{c.cta}</span>}
          </div>
        )}
      </div>
      <div className="ld-ad-foot">
        <div className="ld-ad-name">
          <span title={ad.name}>{ad.name}</span>
          <span className="ld-ads-status" data-tone={st.tone}>
            {st.label}
          </span>
        </div>
        <dl className="ld-ad-stats">
          <div>
            <dt>Spent</dt>
            <dd>{tally.spend ? usd(tally.spend) : "–"}</dd>
          </div>
          <div>
            <dt>CPM</dt>
            <dd>{cpm(tally)}</dd>
          </div>
          <div>
            <dt>CTR</dt>
            <dd>{ctr(tally)}</dd>
          </div>
          <div>
            <dt>Leads</dt>
            <dd>
              {tally.leads}
              <small>{cost(tally.spend, tally.leads)}</small>
            </dd>
          </div>
          <div>
            <dt>
              <Star size={10} className="ld-hot-star" aria-hidden="true" /> Stars
            </dt>
            <dd>{tally.hot || "–"}</dd>
          </div>
          <div>
            <dt>Accounts</dt>
            <dd>{tally.accounts}</dd>
          </div>
          <div>
            <dt>Paying</dt>
            <dd>
              {tally.paying}
              <small>{cost(tally.spend, tally.paying)}</small>
            </dd>
          </div>
          <div>
            <dt>Revenue</dt>
            <dd>
              {tally.revenue ? usd(tally.revenue) : "–"}
              <small>{roas(tally)}</small>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function CampaignPanel({ c, adsets }: { c: CampaignRow; adsets: MetaAdset[] }) {
  const st = statusOf(c.status);
  const m = c.meta;
  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null);
  const dates = m?.startTime ? `${date(m.startTime)}${m.stopTime ? ` to ${date(m.stopTime)}` : ", no end date"}` : "Not scheduled";
  return (
    <aside className="ld-ads-card ld-ads-panel">
      <div className="ld-ads-card-head">
        <h2>Campaign</h2>
      </div>
      <dl className="ld-ads-facts">
        <div>
          <dt>Name</dt>
          <dd>{c.name}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className="ld-ads-status" data-tone={st.tone}>
              {st.label}
            </span>
          </dd>
        </div>
        <div>
          <dt>Promotion</dt>
          <dd>{c.promotion}</dd>
        </div>
        <div>
          <dt>Funnel stage</dt>
          <dd>{STAGE_LABELS[c.stage]}</dd>
        </div>
        {m?.objective && (
          <div>
            <dt>Objective</dt>
            <dd>{OBJECTIVES[m.objective] ?? m.objective}</dd>
          </div>
        )}
        <div>
          <dt>Budget</dt>
          <dd>{c.budget ? `${usd(c.budget)} a day` : m?.lifetimeBudget ? `${usd(m.lifetimeBudget)} lifetime` : "–"}</dd>
        </div>
        {m && (
          <div>
            <dt>Dates</dt>
            <dd>{dates}</dd>
          </div>
        )}
        <div>
          <dt>Tracking tag</dt>
          <dd>
            <code>{c.name.toLowerCase()}</code>
          </dd>
        </div>
      </dl>
      {adsets.length > 0 && (
        <>
          <h3 className="ld-ads-panel-sub">Audiences</h3>
          {adsets.map((s) => (
            <div key={s.id} className="ld-ads-adset">
              <strong>
                {s.name}
                {s.dailyBudget ? <small> · {usd(s.dailyBudget)}/day</small> : null}
              </strong>
              {s.audience.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ))}
        </>
      )}
      {!m && <p className="ld-ads-meta">Meta doesn&apos;t list this campaign, so only what its leads recorded is shown.</p>}
    </aside>
  );
}
