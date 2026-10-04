"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LiveMap, { STAGE_COLORS } from "./LiveMap";
import SourceLogo from "./SourceLogo";
import { SOURCE_LABELS } from "./shared";
import {
  BOUNCE_LABELS,
  bounceOf,
  fmtDuration,
  pct,
  LIVE_STAGE_LABELS,
  liveSource,
  pageLabel,
  isFunnelSession,
  type LiveCounters,
  type LiveScope,
  type LiveSession,
  type LiveSnapshot,
  type LiveStage,
} from "./liveTypes";

/**
 * Live View: who is on the site right now and where they are in the funnel.
 *
 * Shopify's Live View, for the Apex Pop funnel (Stefano, 2026-10-02). A dot
 * on the map for every visitor here now, the counts beside it, and a feed of
 * the people behind the dots: where they came from, the email once the
 * qualifier has it, the step they are on and how long they have been here.
 * Polls every five seconds; durations tick every second in between.
 */

const POLL_MS = 5000;
const FUNNEL: LiveStage[] = ["browsing", "form", "signup", "checkout", "paid"];
const TOTAL_KEY: Record<LiveStage, keyof LiveCounters> = {
  browsing: "sessions",
  form: "form",
  signup: "signup",
  checkout: "checkout",
  paid: "paid",
};

function who(s: LiveSession) {
  if (s.name && s.email) return { title: s.name, sub: s.email };
  if (s.email) return { title: s.email, sub: null };
  const place = [s.city, s.region].filter(Boolean).join(", ");
  return { title: place ? `Visitor from ${place}` : "Visitor", sub: null };
}

function StagePill({ s }: { s: LiveSession }) {
  const stage = s.maxStage === "paid" ? "paid" : s.stage;
  const label = stage === "form" && s.step ? `Form · step ${s.step} of 3` : LIVE_STAGE_LABELS[stage];
  return (
    <span className="ld-live-pill" style={{ ["--pill" as string]: STAGE_COLORS[stage] }}>
      {stage === "paid" && s.purchase ? `${label} · ${s.purchase}` : label}
    </span>
  );
}

function FeedRow({
  s,
  now,
  live,
  focused,
  onFocus,
}: {
  s: LiveSession;
  now: number;
  live: boolean;
  focused: boolean;
  onFocus: (sid: string | null) => void;
}) {
  const source = liveSource(s);
  const person = who(s);
  const place = [s.city, s.region].filter(Boolean).join(", ");
  return (
    <li
      className="ld-live-row"
      data-focused={focused}
      data-live={live}
      onMouseEnter={() => onFocus(s.sid)}
      onMouseLeave={() => onFocus(null)}
    >
      <span className="ld-live-row-source" title={SOURCE_LABELS[source]}>
        <SourceLogo source={source} />
      </span>
      <span className="ld-live-row-who">
        <strong>{person.title}</strong>
        <small title={(s.trail ?? []).map((t) => pageLabel(t.p)).join(" → ") || undefined}>
          {[
            person.sub,
            live ? `On ${pageLabel(s.path)}` : `Left from ${pageLabel(s.path)}`,
            s.landingPath && s.landingPath !== s.path ? `came in on ${pageLabel(s.landingPath)}` : null,
            s.email && place ? place : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </small>
      </span>
      <StagePill s={s} />
      <span className="ld-live-row-meta">
        {bounceOf(s, live) && (
          <span className="ld-live-tag ld-live-bounce" data-bounce={bounceOf(s, live)}>
            {BOUNCE_LABELS[bounceOf(s, live)!]}
          </span>
        )}
        {s.device === "mobile" ? <Smartphone size={13} aria-label="Phone" /> : <Monitor size={13} aria-label="Computer" />}
        {s.returning && <span className="ld-live-tag">Returning</span>}
        {s.accountAt && (
          <span className="ld-live-tag ld-live-tag-account" title={s.accountFrom ? `From ${pageLabel(s.accountFrom)}` : undefined}>
            Created account
          </span>
        )}
      </span>
      <span className="ld-live-row-time" title={live ? "Time on site" : "Session length"}>
        {fmtDuration((live ? now : s.lastSeen) - s.startedAt)}
      </span>
    </li>
  );
}

/** "Top N" rows from one of the day's page-count maps. */
function topOf(map: Record<string, number> | undefined, n = 8): [string, number][] {
  return Object.entries(map ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function PageList({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <div className="ld-live-pages-col">
      <h4>{title}</h4>
      {rows.length === 0 ? (
        <p className="ld-live-empty">{empty}</p>
      ) : (
        <ul className="ld-live-sources">
          {rows.map(([path, n]) => (
            <li key={path} title={path}>
              <span className="ld-live-page-name">{pageLabel(path)}</span>
              <i style={{ width: `${(n / max) * 100}%` }} />
              <b>{n}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LiveView({
  endpoint = "/api/leads/live",
  scope = "site",
}: {
  endpoint?: string;
  /** "funnel": Facebook and Instagram traffic and the Apex Pop pages only. "site": everyone. */
  scope?: LiveScope;
}) {
  const [snap, setSnap] = useState<LiveSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number>(0);
  const [now, setNow] = useState(() => Date.now());
  const [focused, setFocused] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setSnap(body as LiveSnapshot);
      setFetchedAt(Date.now());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [endpoint]);

  useEffect(() => {
    load();
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [load]);

  const inScope = useCallback((s: LiveSession) => scope === "site" || isFunnelSession(s), [scope]);
  const active = useMemo(() => (snap?.active ?? []).filter(inScope), [snap, inScope]);
  const todayInScope = useMemo(() => (snap?.today ?? []).filter(inScope), [snap, inScope]);
  const activeSids = useMemo(() => new Set(active.map((s) => s.sid)), [active]);
  const earlier = useMemo(() => todayInScope.filter((s) => !activeSids.has(s.sid)), [todayInScope, activeSids]);
  // The funnel view reads the day's Meta-only counters, kept beside the totals since 2026-10-04.
  const totals: LiveCounters = (scope === "funnel" ? snap?.totals.fb : snap?.totals) ?? {};
  const rightNowPages = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of active) counts[s.path] = (counts[s.path] ?? 0) + 1;
    return topOf(counts, 6);
  }, [active]);

  const liveByStage = useMemo(() => {
    const counts: Record<LiveStage, number> = { browsing: 0, form: 0, signup: 0, checkout: 0, paid: 0 };
    for (const s of active) counts[s.maxStage === "paid" ? "paid" : s.stage] += 1;
    return counts;
  }, [active]);

  const bySource = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of todayInScope) {
      const key = liveSource(s);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [todayInScope]);
  const sourceMax = Math.max(1, ...bySource.map(([, n]) => n));

  const sessions = totals.sessions ?? 0;
  const paid = totals.paid ?? 0;
  // Bounces: reached the step, went no further, and is not still on it now.
  const stillAtSignup = active.filter((s) => s.maxStage === "signup").length;
  const stillAtCheckout = active.filter((s) => s.maxStage === "checkout").length;
  const signups = totals.signup ?? 0;
  const checkouts = totals.checkout ?? 0;
  const bouncedSignup = Math.max(0, signups - (totals.signupPassed ?? 0) - stillAtSignup);
  const bouncedCheckout = Math.max(0, checkouts - (totals.checkoutPassed ?? 0) - stillAtCheckout);
  const returning = totals.returning ?? 0;
  const ago = fetchedAt ? Math.round((now - fetchedAt) / 1000) : null;

  return (
    <div className="ld-live">
      <aside className="ld-live-side">
        <div className="ld-live-head">
          <span className="ld-live-beacon" data-ok={!error} />
          <strong>{scope === "funnel" ? "Facebook funnel" : "Whole website"}</strong>
          <span className="ld-live-ago">
            {error ? "Not updating" : ago === null ? "Connecting" : ago <= 2 ? "Just now" : `${ago}s ago`}
          </span>
        </div>
        {error && <div className="ld-banner ld-banner-error">{error}</div>}

        <div className="ld-live-cards">
          <div className="ld-live-card">
            <span>Visitors right now</span>
            <b>{active.length}</b>
          </div>
          <div className="ld-live-card">
            <span>Purchases today</span>
            <b>{totals.paid ?? 0}</b>
          </div>
          <div className="ld-live-card">
            <span>Sessions today</span>
            <b>{sessions}</b>
          </div>
          <div className="ld-live-card">
            <span>Leads today</span>
            <b>{totals.leads ?? 0}</b>
            <small>email captured</small>
          </div>
          <div className="ld-live-card">
            <span>Accounts created today</span>
            <b>{totals.accounts ?? 0}</b>
            <small>{pct(totals.accounts ?? 0, sessions)} of visitors</small>
          </div>
          <div className="ld-live-card ld-live-card-wide">
            <span>Conversion rate</span>
            <b>{pct(paid, sessions)}</b>
            <small>
              {sessions} visitor{sessions === 1 ? "" : "s"} → {paid} purchase{paid === 1 ? "" : "s"} today
            </small>
          </div>
        </div>

        <section className="ld-live-block">
          <h3>Drop-off · today</h3>
          <div className="ld-live-drops">
            <div data-bounce="signup">
              <span>Bounced at sign-up</span>
              <b>{bouncedSignup}</b>
              <small>{pct(bouncedSignup, signups)} of {signups} who reached sign-up</small>
            </div>
            <div data-bounce="checkout">
              <span>Bounced at checkout</span>
              <b>{bouncedCheckout}</b>
              <small>{pct(bouncedCheckout, checkouts)} of {checkouts} who reached checkout</small>
            </div>
          </div>
        </section>

        <section className="ld-live-block">
          <h3>Visitor behavior</h3>
          <div className="ld-live-funnel">
            {FUNNEL.map((stage) => (
              <div key={stage} className="ld-live-funnel-step">
                <span className="ld-live-funnel-dot" style={{ background: STAGE_COLORS[stage] }} />
                <span className="ld-live-funnel-label">{LIVE_STAGE_LABELS[stage]}</span>
                <b>{liveByStage[stage]}</b>
                <small>
                  {totals[TOTAL_KEY[stage]] ?? 0} today
                  {stage !== "browsing" && <em> · {pct(totals[TOTAL_KEY[stage]] ?? 0, sessions)}</em>}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="ld-live-block">
          <h3>Sessions by source · today</h3>
          {bySource.length === 0 ? (
            <p className="ld-live-empty">No sessions yet today</p>
          ) : (
            <ul className="ld-live-sources">
              {bySource.map(([source, n]) => (
                <li key={source}>
                  <SourceLogo source={source as Parameters<typeof SourceLogo>[0]["source"]} />
                  <span>{SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] ?? source}</span>
                  <i style={{ width: `${(n / sourceMax) * 100}%` }} />
                  <b>{n}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ld-live-block ld-live-split">
          <div>
            <span>New</span>
            <b>{Math.max(0, sessions - returning)}</b>
          </div>
          <div>
            <span>Returning</span>
            <b>{returning}</b>
          </div>
        </section>
      </aside>

      <div className="ld-live-main">
        <div className="ld-live-mapcard">
          <LiveMap sessions={active} focusedSid={focused} onFocus={setFocused} />
          <div className="ld-live-legend">
            {FUNNEL.map((stage) => (
              <span key={stage}>
                <i style={{ background: STAGE_COLORS[stage] }} />
                {LIVE_STAGE_LABELS[stage]}
              </span>
            ))}
          </div>
        </div>

        {scope === "site" && (
          <section className="ld-live-pages">
            <PageList title="On these pages right now" rows={rightNowPages} empty="Nobody on the site at the moment." />
            <PageList title="Top pages today" rows={topOf(snap?.totals.pageViews)} empty="No page views yet today." />
            <PageList title="Landing pages today" rows={topOf(snap?.totals.landings)} empty="No visits yet today." />
            <PageList
              title="Accounts created from"
              rows={topOf(snap?.totals.accountFrom)}
              empty="No accounts created yet today."
            />
          </section>
        )}

        <section className="ld-live-feed">
          <h3>
            Right now <span>{active.length}</span>
          </h3>
          {active.length === 0 ? (
            <p className="ld-live-empty">Nobody on the site at the moment. New visitors appear here within a few seconds.</p>
          ) : (
            <ul>
              {active.map((s) => (
                <FeedRow key={s.sid} s={s} now={now} live focused={focused === s.sid} onFocus={setFocused} />
              ))}
            </ul>
          )}

          <h3>
            Earlier today <span>{earlier.length}</span>
          </h3>
          {earlier.length === 0 ? (
            <p className="ld-live-empty">Sessions that ended today show here with how long they stayed.</p>
          ) : (
            <ul>
              {earlier.map((s) => (
                <FeedRow key={s.sid} s={s} now={now} live={false} focused={false} onFocus={() => {}} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
