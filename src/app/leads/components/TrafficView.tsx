"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { pct } from "./liveTypes";

/**
 * Sources & times (Stefano, 2026-10-04): with the marketing calendar posting
 * to YouTube Shorts, Instagram and Facebook, which platform brings the
 * visitors who create accounts, and at what hours they arrive.
 *
 * Reads the backend's per-day counters (`/traffic`): visits, leads, accounts
 * and purchases per platform (organic and paid kept apart), visits and
 * accounts per New York hour, and per utm_campaign. The link builder at the
 * bottom makes the tagged link each post should carry, because Instagram's
 * and YouTube's in-app browsers usually hide where a click came from.
 */

type Metric = "sessions" | "leads" | "accounts" | "signup" | "paid";
type DayDoc = {
  day: string;
  sessions?: number;
  src?: Record<string, Partial<Record<Metric, number>>>;
  hours?: Record<string, Partial<Record<"sessions" | "accounts" | "leads", Record<string, number>>>>;
  campaigns?: Record<string, Partial<Record<Metric, number>>>;
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  google: "Google",
  bing: "Bing & others",
  chatgpt: "ChatGPT",
  x: "X",
  linkedin: "LinkedIn",
  email: "Email & SMS",
  primewell: "PrimeWell",
  reddit: "Reddit",
  direct: "Direct",
  other: "Other sites",
};
const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#ff0033",
  instagram: "#d62976",
  facebook: "#1877f2",
  tiktok: "#111111",
  google: "#34a853",
  bing: "#00809d",
  chatgpt: "#10a37f",
  x: "#1d1d1f",
  linkedin: "#0a66c2",
  email: "#f59e0b",
  primewell: "#1d4ed8",
  reddit: "#ff4500",
  direct: "#667085",
  other: "#98a2b3",
};
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RANGES = [7, 30, 90];

const splitKey = (key: string) => {
  const paid = key.endsWith("_paid");
  const platform = paid ? key.slice(0, -5) : key;
  return { platform, paid };
};
const sourceLabel = (key: string) => {
  const { platform, paid } = splitKey(key);
  return `${PLATFORM_LABELS[platform] ?? platform}${paid ? " (paid)" : ""}`;
};
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
/** Monday-first weekday of a YYYY-MM-DD New York date. */
const weekdayOf = (day: string) => (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;

const DESTINATIONS = [
  { path: "/", label: "Home page" },
  { path: "/apex-pop/start", label: "Apex Pop qualifier" },
  { path: "/pricing", label: "Pricing" },
  { path: "/tools/fba-calculator", label: "Free FBA calculator" },
  { path: "/free-course", label: "Free course" },
];
const POST_PLATFORMS = [
  { id: "youtube", label: "YouTube Shorts" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
];

function LinkBuilder() {
  const [platform, setPlatform] = useState("instagram");
  const [post, setPost] = useState("");
  const [dest, setDest] = useState("/");
  const [copied, setCopied] = useState(false);
  const slug =
    post
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `${platform}-post`;
  const link = `https://www.apexapplications.io${dest}?utm_source=${platform}&utm_medium=organic_social&utm_campaign=${slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // the link stays visible to select
    }
  };
  return (
    <section className="ld-live-block ld-traffic-builder">
      <h3>Link for a post</h3>
      <p className="ld-live-empty">
        Put this link in the post, caption or bio. Its results then show up under the post&apos;s name in the
        campaigns table.
      </p>
      <div className="ld-traffic-builder-row">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Platform">
          {POST_PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <input value={post} onChange={(e) => setPost(e.target.value)} placeholder="Post name, e.g. oct-7 po builder" />
        <select value={dest} onChange={(e) => setDest(e.target.value)} aria-label="Destination page">
          {DESTINATIONS.map((d) => (
            <option key={d.path} value={d.path}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="ld-traffic-link">
        <code>{link}</code>
        <button type="button" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}

export default function TrafficView({ endpoint = "/api/leads/live?view=traffic" }: { endpoint?: string }) {
  const [range, setRange] = useState(30);
  const [days, setDays] = useState<DayDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [heatMetric, setHeatMetric] = useState<"sessions" | "accounts">("sessions");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${endpoint}&days=${range}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setDays(body.days as DayDoc[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [endpoint, range]);

  useEffect(() => {
    load();
    const poll = window.setInterval(() => document.visibilityState === "visible" && load(), 60_000);
    return () => window.clearInterval(poll);
  }, [load]);

  const tracked = (days ?? []).filter((d) => d.src);
  const sources = useMemo(() => {
    const totals: Record<string, Record<Metric, number>> = {};
    for (const d of tracked) {
      for (const [key, m] of Object.entries(d.src ?? {})) {
        const t = (totals[key] = totals[key] ?? { sessions: 0, leads: 0, accounts: 0, signup: 0, paid: 0 });
        for (const metric of Object.keys(t) as Metric[]) t[metric] += m[metric] ?? 0;
      }
    }
    return Object.entries(totals).sort((a, b) => b[1].sessions - a[1].sessions || b[1].accounts - a[1].accounts);
  }, [tracked]);
  const totalSessions = sources.reduce((s, [, m]) => s + m.sessions, 0);
  const totalAccounts = sources.reduce((s, [, m]) => s + m.accounts, 0);
  const maxSessions = Math.max(1, ...sources.map(([, m]) => m.sessions));

  // Weekday x hour grid for the chosen platform ("all", or a source key).
  const grid = useMemo(() => {
    const cells = Array.from({ length: 7 }, () => Array(24).fill(0) as number[]);
    for (const d of tracked) {
      const wd = weekdayOf(d.day);
      for (const [hour, metrics] of Object.entries(d.hours ?? {})) {
        const bySrc = metrics[heatMetric] ?? {};
        const n =
          filter === "all"
            ? Object.values(bySrc).reduce((a, b) => a + b, 0)
            : Object.entries(bySrc)
                .filter(([k]) => splitKey(k).platform === filter)
                .reduce((a, [, v]) => a + v, 0);
        cells[wd][Number(hour)] += n;
      }
    }
    return cells;
  }, [tracked, filter, heatMetric]);
  const gridMax = Math.max(1, ...grid.flat());
  const peaks = grid
    .flatMap((row, wd) => row.map((n, h) => ({ wd, h, n })))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);
  const byHour = grid.reduce((acc, row) => acc.map((v, h) => v + row[h]), Array(24).fill(0) as number[]);
  const hourMax = Math.max(1, ...byHour);

  const campaigns = useMemo(() => {
    const totals: Record<string, Record<Metric, number>> = {};
    for (const d of tracked) {
      for (const [name, m] of Object.entries(d.campaigns ?? {})) {
        const t = (totals[name] = totals[name] ?? { sessions: 0, leads: 0, accounts: 0, signup: 0, paid: 0 });
        for (const metric of Object.keys(t) as Metric[]) t[metric] += m[metric] ?? 0;
      }
    }
    return Object.entries(totals)
      .sort((a, b) => b[1].accounts - a[1].accounts || b[1].sessions - a[1].sessions)
      .slice(0, 15);
  }, [tracked]);
  const platformsSeen = [...new Set(sources.map(([k]) => splitKey(k).platform))];

  return (
    <div className="ld-traffic">
      <div className="ld-traffic-top">
        <div className="ld-live-switch" role="tablist" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r} type="button" role="tab" aria-selected={range === r} onClick={() => setRange(r)}>
              {r} days
            </button>
          ))}
        </div>
        <span className="ld-live-ago">
          {tracked.length < (days?.length ?? 0)
            ? `Tracked by source for ${tracked.length} of these ${days?.length} days`
            : `${totalSessions.toLocaleString()} visits · ${totalAccounts.toLocaleString()} accounts`}
        </span>
      </div>
      {error && <div className="ld-banner ld-banner-error">{error}</div>}

      <section className="ld-live-block">
        <h3>Where visitors come from</h3>
        {sources.length === 0 ? (
          <p className="ld-live-empty">
            Platform tracking starts with this release; the table fills in from the first visits after it.
          </p>
        ) : (
          <table className="ld-app-table ld-traffic-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Visits</th>
                <th />
                <th>Leads</th>
                <th>Accounts</th>
                <th>Purchases</th>
                <th>Visit → account</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(([key, m]) => {
                const { platform } = splitKey(key);
                return (
                  <tr key={key}>
                    <td>
                      <span className="ld-traffic-dot" style={{ background: PLATFORM_COLORS[platform] ?? "#98a2b3" }} />
                      {sourceLabel(key)}
                    </td>
                    <td>{m.sessions.toLocaleString()}</td>
                    <td className="ld-traffic-barcell">
                      <i
                        style={{
                          width: `${(m.sessions / maxSessions) * 100}%`,
                          background: PLATFORM_COLORS[platform] ?? "#98a2b3",
                        }}
                      />
                    </td>
                    <td>{m.leads}</td>
                    <td>
                      <b>{m.accounts}</b>
                    </td>
                    <td>{m.paid}</td>
                    <td>{pct(m.accounts, m.sessions)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="ld-live-block">
        <div className="ld-traffic-head">
          <h3>When they arrive · New York time</h3>
          <div className="ld-traffic-controls">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Platform">
              <option value="all">All platforms</option>
              {platformsSeen.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p] ?? p}
                </option>
              ))}
            </select>
            <div className="ld-live-switch" role="tablist" aria-label="Metric">
              <button type="button" aria-selected={heatMetric === "sessions"} onClick={() => setHeatMetric("sessions")}>
                Visits
              </button>
              <button type="button" aria-selected={heatMetric === "accounts"} onClick={() => setHeatMetric("accounts")}>
                Accounts
              </button>
            </div>
          </div>
        </div>
        {peaks.length > 0 && (
          <p className="ld-traffic-peaks">
            Busiest: {peaks.map((c) => `${WEEKDAYS[c.wd]} ${hourLabel(c.h)}`).join(" · ")}
          </p>
        )}
        <div className="ld-heat">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="ld-heat-hour">
              {h % 3 === 0 ? hourLabel(h) : ""}
            </span>
          ))}
          {grid.map((row, wd) => (
            <div key={wd} className="ld-heat-row">
              <span className="ld-heat-day">{WEEKDAYS[wd]}</span>
              {row.map((n, h) => (
                <i
                  key={h}
                  title={`${WEEKDAYS[wd]} ${hourLabel(h)}: ${n} ${heatMetric === "sessions" ? "visits" : "accounts"}`}
                  style={{ opacity: n ? 0.15 + 0.85 * (n / gridMax) : 1, background: n ? undefined : "var(--ld-bg)" }}
                  data-on={n > 0}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="ld-heat-bars" aria-label="By hour">
          {byHour.map((n, h) => (
            <i key={h} title={`${hourLabel(h)}: ${n}`} style={{ height: `${(n / hourMax) * 100}%` }} />
          ))}
        </div>
      </section>

      <section className="ld-live-block">
        <h3>Posts and campaigns</h3>
        {campaigns.length === 0 ? (
          <p className="ld-live-empty">Visits from tagged links (utm_campaign) show here, one row per post or campaign.</p>
        ) : (
          <table className="ld-app-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Visits</th>
                <th>Leads</th>
                <th>Accounts</th>
                <th>Purchases</th>
                <th>Visit → account</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(([name, m]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{m.sessions}</td>
                  <td>{m.leads}</td>
                  <td>
                    <b>{m.accounts}</b>
                  </td>
                  <td>{m.paid}</td>
                  <td>{pct(m.accounts, m.sessions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <LinkBuilder />
    </div>
  );
}
