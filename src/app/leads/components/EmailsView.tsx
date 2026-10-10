"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { DeskActivity, DeskEmail, DeskList, DeskQueue, DeskWindow } from "../../../lib/leads/emailDesk";
import { apiUrl } from "./shared";

/**
 * Emails (Stefano, 2026-10-10), owner only. Every automatic email Apex sends
 * through Mandrill: what it looks like, whether its switch is on, how it is
 * doing over 30 or 14 days, who got it, who clicked, and who the next run
 * would send it to (from the campaign's own dry run, so every filter and cap
 * applies and nothing is sent).
 */

type Period = "d30" | "d14";

const STATE_LABEL: Record<DeskEmail["state"], { label: string; tone: string }> = {
  live: { label: "On", tone: "on" },
  always: { label: "Always on", tone: "on" },
  dry: { label: "Test mode", tone: "warn" },
  off: { label: "Off", tone: "off" },
};

const GROUP_ORDER = ["Getting started", "Using Apex", "Paying customers", "Win-back", "Account"];

const int = (n: number) => n.toLocaleString("en-US");
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 1000) / 10}%` : "–");
const nyTime = (d: string | number) =>
  new Date(d).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function ago(iso: string): string {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)} h ago`;
}

function sum(windows: DeskWindow[]): DeskWindow {
  const out: DeskWindow = { sent: 0, delivered: 0, uniqueOpens: 0, opens: 0, bounces: 0, unsubs: 0, humanClicks: 0, clickers: 0 };
  for (const w of windows) for (const k of Object.keys(out) as (keyof DeskWindow)[]) out[k] += w[k];
  return out;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  return body as T;
}

export default function EmailsView() {
  const [list, setList] = useState<DeskList | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("d30");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (fresh: boolean) => {
    setRefreshing(true);
    setListError(null);
    try {
      const data = await getJson<DeskList>(`/api/leads/emails${fresh ? "?fresh=1" : ""}`);
      setList(data);
      setSelectedId((id) => id ?? data.emails[0]?.id ?? null);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not load emails");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const groups = useMemo(() => {
    const byGroup = new Map<string, DeskEmail[]>();
    for (const e of list?.emails ?? []) byGroup.set(e.group, [...(byGroup.get(e.group) ?? []), e]);
    return [...byGroup.entries()].sort((a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]));
  }, [list]);

  const windowOf = useCallback(
    (email: DeskEmail, template?: string) =>
      sum(
        email.templates
          .filter((t) => !template || t.template === template)
          .map((t) => list?.stats[t.template]?.[period])
          .filter((w): w is DeskWindow => Boolean(w)),
      ),
    [list, period],
  );

  const selected = list?.emails.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="ld-emails">
      <div className="ld-emails-head">
        <div className="ld-view-switch" role="tablist" aria-label="Period">
          <button type="button" data-active={period === "d30"} onClick={() => setPeriod("d30")}>
            30 days
          </button>
          <button type="button" data-active={period === "d14"} onClick={() => setPeriod("d14")}>
            14 days
          </button>
        </div>
        {list && <span className="ld-ads-meta">Stats updated {ago(list.generatedAt)}</span>}
        <button type="button" className="ld-emails-refresh" onClick={() => load(true)} disabled={refreshing} title="Refresh">
          <RefreshCw size={14} className={refreshing ? "ld-spin" : undefined} />
          {refreshing ? "Loading" : "Refresh"}
        </button>
      </div>

      {listError && <div className="ld-ads-banner">{listError}</div>}
      {!list && !listError && <div className="ld-emails-empty">Loading emails from Mandrill…</div>}

      {list && (
        <div className="ld-emails-body">
          <nav className="ld-emails-list" aria-label="Emails">
            {groups.map(([group, emails]) => (
              <div key={group} className="ld-emails-group">
                <div className="ld-emails-group-title">{group}</div>
                {emails.map((e) => {
                  const w = windowOf(e);
                  const st = STATE_LABEL[e.state];
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className="ld-emails-item"
                      data-active={e.id === selectedId}
                      onClick={() => setSelectedId(e.id)}
                    >
                      <span className="ld-emails-item-top">
                        <span className="ld-emails-item-name">{e.name}</span>
                        <span className="ld-ads-status" data-tone={st.tone}>
                          {st.label}
                        </span>
                      </span>
                      <span className="ld-emails-item-sub">
                        {int(w.sent)} sent · {pct(w.uniqueOpens, w.delivered)} opened · {int(w.clickers)} clicked
                        {e.templates.length > 1 ? ` · ${e.templates.length} emails` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          {selected ? (
            <EmailDetail key={selected.id} email={selected} list={list} period={period} windowOf={windowOf} />
          ) : (
            <div className="ld-emails-empty">Pick an email on the left.</div>
          )}
        </div>
      )}
    </div>
  );
}

function EmailDetail({
  email,
  list,
  period,
  windowOf,
}: {
  email: DeskEmail;
  list: DeskList;
  period: Period;
  windowOf: (email: DeskEmail, template?: string) => DeskWindow;
}) {
  const [template, setTemplate] = useState(email.templates[0].template);
  const st = STATE_LABEL[email.state];
  const w = windowOf(email, template);
  const lastSent = list.stats[template]?.lastSent ?? null;
  const stepLabel = (t: string) => email.templates.find((x) => x.template === t)?.label ?? t.split("/").pop();

  return (
    <section className="ld-emails-detail">
      <div className="ld-ads-card">
        <div className="ld-emails-title">
          <h2>{email.name}</h2>
          <span className="ld-ads-status" data-tone={st.tone}>
            {st.label}
          </span>
        </div>
        <dl className="ld-emails-facts">
          <dt>When</dt>
          <dd>{email.when}</dd>
          <dt>Who</dt>
          <dd>{email.who}</dd>
          <dt>Limits</dt>
          <dd>{email.stops}</dd>
          {email.state === "dry" && (
            <>
              <dt>Switch</dt>
              <dd>In test mode: the job runs and works out who would get it, but sends nothing.</dd>
            </>
          )}
        </dl>
        {email.templates.length > 1 && (
          <div className="ld-view-switch ld-emails-steps" role="tablist" aria-label="Email in the sequence">
            {email.templates.map((t) => (
              <button key={t.template} type="button" data-active={t.template === template} onClick={() => setTemplate(t.template)}>
                {t.label ?? t.template.split("/").pop()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ld-emails-kpis">
        <Kpi label="Sent" value={int(w.sent)} sub={lastSent ? `Last ${nyTime(lastSent)}` : "Not sent yet"} />
        <Kpi label="Delivered" value={int(w.delivered)} sub={w.bounces ? `${int(w.bounces)} bounced` : "No bounces"} />
        <Kpi label="Open rate" value={pct(w.uniqueOpens, w.delivered)} sub={`${int(w.uniqueOpens)} people`} />
        <Kpi label="Click rate" value={pct(w.clickers, w.delivered)} sub={`${int(w.clickers)} people, ${int(w.humanClicks)} clicks`} />
        <Kpi label="Unsubscribed" value={int(w.unsubs)} sub={pct(w.unsubs, w.delivered)} />
      </div>
      <p className="ld-emails-note">
        {period === "d30" ? "Last 30 days." : "Last 14 days."} Opens are Mandrill&apos;s count, which Apple Mail inflates. Clicks
        are counted on our own tracked links, people only, and started on October 10.
      </p>

      <div className="ld-emails-split">
        <Preview template={template} />
        <div className="ld-emails-side">
          <Queue email={email} stepLabel={stepLabel} />
          <Activity template={template} />
        </div>
      </div>
    </section>
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

function Preview({ template }: { template: string }) {
  const [data, setData] = useState<{ html: string; subject: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    setError(null);
    getJson<{ html: string; subject: string | null }>(`/api/leads/emails/preview?template=${encodeURIComponent(template)}`)
      .then((d) => live && setData(d))
      .catch((err) => live && setError(err instanceof Error ? err.message : "Could not render"));
    return () => {
      live = false;
    };
  }, [template]);

  // Links in the preview open in a new tab instead of inside the frame.
  const srcDoc = data ? data.html.replace(/<head([^>]*)>/i, `<head$1><base target="_blank">`) : "";

  return (
    <div className="ld-ads-card ld-emails-preview">
      <div className="ld-ads-card-head">
        <h3 className="ld-emails-h3">Preview</h3>
        <span className="ld-ads-meta">Sample data</span>
      </div>
      {data?.subject && (
        <div className="ld-emails-subject">
          <span>Subject</span> {data.subject}
        </div>
      )}
      {error && <div className="ld-emails-empty">{error}</div>}
      {!data && !error && <div className="ld-emails-empty">Rendering…</div>}
      {data && (
        <iframe
          title="Email preview"
          className="ld-emails-frame"
          srcDoc={srcDoc}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
        />
      )}
    </div>
  );
}

function Queue({ email, stepLabel }: { email: DeskEmail; stepLabel: (t: string) => string | undefined }) {
  const [data, setData] = useState<DeskQueue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email.queue) {
    return (
      <div className="ld-ads-card">
        <h3 className="ld-emails-h3">Who&apos;s next</h3>
        <p className="ld-emails-muted">Sent the moment it&apos;s triggered, so there&apos;s no queue to show.</p>
      </div>
    );
  }
  if (email.queue !== "available") {
    return (
      <div className="ld-ads-card">
        <h3 className="ld-emails-h3">Who&apos;s next</h3>
        <p className="ld-emails-muted">{email.queue}</p>
      </div>
    );
  }

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getJson<DeskQueue>(`/api/leads/emails/queue?id=${encodeURIComponent(email.schedule ?? "")}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not work it out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ld-ads-card">
      <div className="ld-ads-card-head">
        <h3 className="ld-emails-h3">Who&apos;s next</h3>
        <button type="button" className="ld-emails-refresh" onClick={run} disabled={loading}>
          <RefreshCw size={14} className={loading ? "ld-spin" : undefined} />
          {loading ? "Working it out" : data ? "Run again" : "Show who's next"}
        </button>
      </div>
      {!data && !loading && !error && (
        <p className="ld-emails-muted">Who the next run would email if it ran now. Nothing is sent.</p>
      )}
      {loading && <p className="ld-emails-muted">Running the campaign in test mode. The big ones take up to a minute.</p>}
      {error && <p className="ld-emails-muted">{error}</p>}
      {data && !loading && (
        <>
          <p className="ld-emails-muted">
            {data.recipients.length === 0
              ? "Nobody right now."
              : `${int(data.recipients.length)} ${data.recipients.length === 1 ? "person" : "people"} if it ran now.`}
            {email.state !== "live" && email.state !== "always" ? " The switch isn't on, so the real run sends nothing." : ""}
          </p>
          {data.recipients.length > 0 && (
            <div className="ld-emails-table-wrap">
              <table className="ld-ads-table ld-emails-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    {email.templates.length > 1 && <th>Gets</th>}
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recipients.map((r, i) => (
                    <tr key={`${r.email}-${r.template}-${i}`}>
                      <td>
                        {r.email}
                        {r.name && <span className="ld-ads-rowsub">{r.name}</span>}
                      </td>
                      {email.templates.length > 1 && <td>{stepLabel(r.template)}</td>}
                      <td className="ld-emails-why">{r.detail ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Activity({ template }: { template: string }) {
  const [data, setData] = useState<DeskActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBots, setShowBots] = useState(false);

  useEffect(() => {
    let live = true;
    setData(null);
    setError(null);
    getJson<DeskActivity>(`/api/leads/emails/activity?template=${encodeURIComponent(template)}`)
      .then((d) => live && setData(d))
      .catch((err) => live && setError(err instanceof Error ? err.message : "Could not load"));
    return () => {
      live = false;
    };
  }, [template]);

  const clicks = (data?.clicks ?? []).filter((c) => showBots || !c.likelyBot);
  const bots = (data?.clicks ?? []).filter((c) => c.likelyBot).length;

  return (
    <>
      <div className="ld-ads-card">
        <div className="ld-ads-card-head">
          <h3 className="ld-emails-h3">Who clicked</h3>
          {bots > 0 && (
            <label className="ld-emails-check">
              <input type="checkbox" checked={showBots} onChange={(e) => setShowBots(e.target.checked)} />
              Scanners ({bots})
            </label>
          )}
        </div>
        {!data && !error && <p className="ld-emails-muted">Loading…</p>}
        {error && <p className="ld-emails-muted">{error}</p>}
        {data && clicks.length === 0 && <p className="ld-emails-muted">No clicks yet.</p>}
        {clicks.length > 0 && (
          <div className="ld-emails-table-wrap">
            <table className="ld-ads-table ld-emails-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Link</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map((c, i) => (
                  <tr key={`${c.email}-${c.clickedAt}-${i}`}>
                    <td>
                      {c.email}
                      {c.likelyBot && <span className="ld-ads-flag">Scanner</span>}
                    </td>
                    <td className="ld-emails-why" title={c.url}>
                      {c.url.replace(/^https?:\/\/(www\.)?/, "").split("?")[0]}
                    </td>
                    <td>{nyTime(c.clickedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ld-ads-card">
        <div className="ld-ads-card-head">
          <h3 className="ld-emails-h3">Sent in the last 14 days</h3>
          {data && <span className="ld-ads-meta">{int(data.sends.length)}</span>}
        </div>
        {!data && !error && <p className="ld-emails-muted">Loading from Mandrill. The first load takes about a minute.</p>}
        {data && data.sends.length === 0 && <p className="ld-emails-muted">Nothing sent in the last 14 days.</p>}
        {data && data.sends.length > 0 && (
          <div className="ld-emails-table-wrap ld-emails-tall">
            <table className="ld-ads-table ld-emails-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Sent</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {data.sends.map((m, i) => (
                  <tr key={`${m.email}-${m.ts}-${i}`}>
                    <td>
                      {m.email}
                      {m.state !== "sent" && <span className="ld-ads-flag">{m.state}</span>}
                    </td>
                    <td>{nyTime(m.ts * 1000)}</td>
                    <td>{m.opens > 0 ? (m.opens === 1 ? "Yes" : `Yes, ${m.opens}×`) : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
