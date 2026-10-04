"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LiveMap from "./LiveMap";
import { fmtDuration, type LiveSession } from "./liveTypes";

/**
 * Live View, inside the app (Stefano, 2026-10-04): which signed-in sellers
 * are using Apex right now, with their email, plan, the module they are in
 * and where they are; and how much time each spent in the app today and this
 * week, so a customer who pays and never opens Apex shows up as such.
 *
 * Data from the backend's `live` function (/app-snapshot), fed by a
 * heartbeat in the app every thirty seconds while its tab is visible.
 */

const POLL_MS = 10_000;

export const MODULE_COLORS: Record<string, string> = {
  black: "#1d1d1f",
  blue: "#2563eb",
  green: "#16a34a",
  gold: "#ca8a04",
  red: "#dc2626",
};
const MODULE_LABELS: Record<string, string> = {
  black: "Black",
  blue: "Blue",
  green: "Green",
  gold: "Gold",
  red: "Red",
};
const PLAN_LABELS: Record<string, string> = {
  enterprise: "Enterprise",
  pro: "Pro",
  plus: "Plus",
  starter: "Starter",
  free: "Free",
};

interface AppSession {
  sid: string;
  uid: string;
  email?: string;
  name?: string;
  plan?: string;
  module?: string;
  path: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
  device?: "mobile" | "desktop";
  startedAt: number;
  lastSeen: number;
  activeMs?: number;
  left?: boolean;
}

interface AppUser {
  uid: string;
  email?: string;
  plan?: string;
  city?: string;
  region?: string;
  todayMs: number;
  weekMs: number;
  activeDays: number;
  lastSeen: number;
  modules: Record<string, number>;
}

interface AppSnapshot {
  now: number;
  day: string;
  active: AppSession[];
  today: AppSession[];
  users: AppUser[];
}

function PlanPill({ plan }: { plan?: string }) {
  const key = plan ?? "free";
  return (
    <span className="ld-app-plan" data-plan={key}>
      {PLAN_LABELS[key] ?? key}
    </span>
  );
}

function ModulePill({ module }: { module?: string }) {
  const key = module ?? "black";
  return (
    <span className="ld-live-pill" style={{ ["--pill" as string]: MODULE_COLORS[key] ?? MODULE_COLORS.black }}>
      Apex {MODULE_LABELS[key] ?? key}
    </span>
  );
}

/** The app route, in words. */
function routeLabel(path: string) {
  const first = path.split("/").filter(Boolean)[0] ?? "dashboard";
  return first.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function topModule(modules: Record<string, number>) {
  const entries = Object.entries(modules).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0];
}

export default function AppLiveView({ endpoint = "/api/leads/live?view=app" }: { endpoint?: string }) {
  const [snap, setSnap] = useState<AppSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [focused, setFocused] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setSnap(body as AppSnapshot);
      setFetchedAt(Date.now());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [endpoint]);

  useEffect(() => {
    load();
    const poll = window.setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [load]);

  const active = useMemo(() => snap?.active ?? [], [snap]);
  const users = useMemo(() => snap?.users ?? [], [snap]);
  const todayUsers = users.filter((u) => u.todayMs > 0 || u.lastSeen >= new Date(`${snap?.day}T00:00:00`).getTime());
  const totalToday = users.reduce((sum, u) => sum + u.todayMs, 0);
  const byUid = useMemo(() => new Map(users.map((u) => [u.uid, u])), [users]);
  const byPlan = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of todayUsers) counts[u.plan ?? "free"] = (counts[u.plan ?? "free"] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [todayUsers]);
  const byModule = useMemo(() => {
    const ms: Record<string, number> = {};
    for (const u of users) for (const [m, v] of Object.entries(u.modules)) ms[m] = (ms[m] ?? 0) + v;
    const total = Object.values(ms).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(ms)
      .sort((a, b) => b[1] - a[1])
      .map(([m, v]) => [m, v, v / total] as const);
  }, [users]);

  // The shared map draws website sessions; app sessions borrow its shape, coloured by module.
  const mapSessions = useMemo(
    () =>
      active.map(
        (s) =>
          ({
            sid: s.sid,
            vid: s.uid,
            path: s.path,
            stage: "browsing",
            maxStage: "browsing",
            lat: s.lat,
            lon: s.lon,
            startedAt: s.startedAt,
            lastSeen: s.lastSeen,
            color: MODULE_COLORS[s.module ?? "black"],
          }) as LiveSession,
      ),
    [active],
  );
  const ago = fetchedAt ? Math.round((now - fetchedAt) / 1000) : null;

  return (
    <div className="ld-live">
      <aside className="ld-live-side">
        <div className="ld-live-head">
          <span className="ld-live-beacon" data-ok={!error} />
          <strong>In the app</strong>
          <span className="ld-live-ago">
            {error ? "Not updating" : ago === null ? "Connecting" : ago <= 2 ? "Just now" : `${ago}s ago`}
          </span>
        </div>
        {error && <div className="ld-banner ld-banner-error">{error}</div>}

        <div className="ld-live-cards">
          <div className="ld-live-card">
            <span>In the app right now</span>
            <b>{active.length}</b>
          </div>
          <div className="ld-live-card">
            <span>Users today</span>
            <b>{todayUsers.length}</b>
          </div>
          <div className="ld-live-card">
            <span>Time in app today</span>
            <b>{fmtDuration(totalToday)}</b>
            <small>all users</small>
          </div>
          <div className="ld-live-card">
            <span>Average per user</span>
            <b>{todayUsers.length ? fmtDuration(totalToday / todayUsers.length) : "—"}</b>
            <small>today</small>
          </div>
        </div>

        <section className="ld-live-block">
          <h3>Users today by plan</h3>
          {byPlan.length === 0 ? (
            <p className="ld-live-empty">Nobody has used the app yet today.</p>
          ) : (
            <ul className="ld-live-sources">
              {byPlan.map(([plan, n]) => (
                <li key={plan}>
                  <PlanPill plan={plan} />
                  <span />
                  <i style={{ width: `${(n / Math.max(1, todayUsers.length)) * 100}%` }} />
                  <b>{n}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ld-live-block">
          <h3>Where the time goes · 7 days</h3>
          {byModule.length === 0 ? (
            <p className="ld-live-empty">No time recorded yet.</p>
          ) : (
            <ul className="ld-live-sources">
              {byModule.map(([m, ms, share]) => (
                <li key={m}>
                  <span className="ld-live-funnel-dot" style={{ background: MODULE_COLORS[m] }} />
                  <span>Apex {MODULE_LABELS[m] ?? m}</span>
                  <i style={{ width: `${share * 100}%`, background: MODULE_COLORS[m] }} />
                  <b>{fmtDuration(ms)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>

      <div className="ld-live-main">
        <div className="ld-live-mapcard">
          <LiveMap sessions={mapSessions} focusedSid={focused} onFocus={setFocused} />
          <div className="ld-live-legend">
            {Object.entries(MODULE_LABELS).map(([m, label]) => (
              <span key={m}>
                <i style={{ background: MODULE_COLORS[m] }} />
                Apex {label}
              </span>
            ))}
          </div>
        </div>

        <section className="ld-live-feed">
          <h3>
            Right now <span>{active.length}</span>
          </h3>
          {active.length === 0 ? (
            <p className="ld-live-empty">Nobody is signed in to the app at the moment.</p>
          ) : (
            <ul>
              {active.map((s) => {
                const u = byUid.get(s.uid);
                const place = [s.city, s.region].filter(Boolean).join(", ");
                return (
                  <li
                    key={s.sid}
                    className="ld-live-row"
                    data-live
                    data-focused={focused === s.sid}
                    onMouseEnter={() => setFocused(s.sid)}
                    onMouseLeave={() => setFocused(null)}
                  >
                    <span className="ld-live-row-source">
                      <PlanPill plan={s.plan} />
                    </span>
                    <span className="ld-live-row-who">
                      <strong>{s.email ?? s.name ?? "Signed-in user"}</strong>
                      <small>{[routeLabel(s.path), place].filter(Boolean).join(" · ")}</small>
                    </span>
                    <ModulePill module={s.module} />
                    <span className="ld-live-row-meta">
                      {s.device === "mobile" ? <Smartphone size={13} aria-label="Phone" /> : <Monitor size={13} aria-label="Computer" />}
                      {u && <span className="ld-live-tag">Today {fmtDuration(u.todayMs)}</span>}
                    </span>
                    <span className="ld-live-row-time" title="This session">
                      {fmtDuration(now - s.startedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <h3>
            Users · last 7 days <span>{users.length}</span>
          </h3>
          {users.length === 0 ? (
            <p className="ld-live-empty">App usage appears here as soon as signed-in users open Apex.</p>
          ) : (
            <div className="ld-app-table-wrap">
              <table className="ld-app-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Location</th>
                    <th>Today</th>
                    <th>7 days</th>
                    <th>Days active</th>
                    <th>Most used</th>
                    <th>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const top = topModule(u.modules);
                    return (
                      <tr key={u.uid}>
                        <td>{u.email ?? u.uid}</td>
                        <td>
                          <PlanPill plan={u.plan} />
                        </td>
                        <td>{[u.city, u.region].filter(Boolean).join(", ") || "—"}</td>
                        <td>{u.todayMs ? fmtDuration(u.todayMs) : "—"}</td>
                        <td>{fmtDuration(u.weekMs)}</td>
                        <td>{u.activeDays}</td>
                        <td>{top ? <ModulePill module={top} /> : "—"}</td>
                        <td>{fmtDuration(now - u.lastSeen)} ago</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
