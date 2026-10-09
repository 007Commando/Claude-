"use client";

/**
 * The Calls view: a scoreboard for the sales rep's phone work. Per caller
 * (calls, connect rate, talk time, hot leads, booked), the latest calls with
 * the AI's one-line read of each, and the follow-ups that have come due.
 * Calls arrive from LeadDesk (one fetch of the last 90 days); until the
 * backend job is deployed that list is empty and every block says
 * "No calls yet".
 */

import { useMemo, useState } from "react";
import type { Lead } from "../../../lib/leads/model";
import {
  formatCallStamp,
  formatDayLabel,
  formatDuration,
  followUpDay,
  isBookedCall,
  isHotCall,
  nyDay,
  type SalesCall,
} from "../../../lib/leads/calls";
import { todayNY } from "./shared";
import { OutcomeChip } from "./callUi";
import CommissionsSection from "./CommissionsSection";

type Range = "today" | "7d" | "30d";
const RANGES: { id: Range; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
];
const DAY_MS = 86_400_000;
const RECENT_LIMIT = 100;

interface CallerRow {
  key: string;
  name: string;
  calls: number;
  connected: number;
  talkSec: number;
  connectedSec: number;
  hot: number;
  booked: number;
}

const blank = (key: string, name: string): CallerRow => ({ key, name, calls: 0, connected: 0, talkSec: 0, connectedSec: 0, hot: 0, booked: 0 });

function tally(row: CallerRow, call: SalesCall) {
  row.calls += 1;
  row.talkSec += call.durationSec ?? 0;
  if (call.connected) {
    row.connected += 1;
    row.connectedSec += call.durationSec ?? 0;
  }
  if (isHotCall(call)) row.hot += 1;
  if (isBookedCall(call)) row.booked += 1;
}

const rate = (row: CallerRow) => (row.calls > 0 ? `${Math.round((row.connected / row.calls) * 100)}%` : "–");
const avgConnected = (row: CallerRow) => (row.connected > 0 ? formatDuration(row.connectedSec / row.connected) : "–");

/** One call per contact whose follow-up date has come due: the contact's latest follow-up, unless a later conversation replaced it. */
function dueFollowUps(calls: SalesCall[], today: string): { call: SalesCall; day: string }[] {
  const byContact = new Map<string, SalesCall[]>();
  for (const call of calls) {
    const list = byContact.get(call.contactId) ?? [];
    list.push(call);
    byContact.set(call.contactId, list);
  }
  const out: { call: SalesCall; day: string }[] = [];
  for (const list of byContact.values()) {
    list.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
    const latest = list.find((c) => followUpDay(c.summary?.followUpDate));
    if (!latest) continue;
    const day = followUpDay(latest.summary?.followUpDate) as string;
    if (day > today) continue;
    // A later conversation that set no new follow-up has dealt with it.
    if (list.some((c) => c.startedAt > latest.startedAt && c.connected)) continue;
    out.push({ call: latest, day });
  }
  return out.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}

export default function CallsView({
  calls,
  loading,
  leads,
  onOpenLead,
  showCommissions = false,
}: {
  calls: SalesCall[];
  loading: boolean;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  /** Commissions are the owner's view; team members don't see them. */
  showCommissions?: boolean;
}) {
  const [range, setRange] = useState<Range>("7d");

  const leadByContact = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const lead of leads) if (lead.ghlLocation === "apex" && lead.ghlContactId) map.set(lead.ghlContactId, lead);
    return map;
  }, [leads]);

  const today = todayNY();
  const inRange = useMemo(() => {
    const cutoff = Date.now() - (range === "7d" ? 7 : 30) * DAY_MS;
    return calls
      .filter((c) => (range === "today" ? nyDay(c.startedAt) === today : new Date(c.startedAt).getTime() >= cutoff))
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
  }, [calls, range, today]);

  const callers = useMemo(() => {
    const rows = new Map<string, CallerRow>();
    for (const call of inRange) {
      const key = call.userId || call.userName || "unknown";
      let row = rows.get(key);
      if (!row) {
        row = blank(key, call.userName || "Unknown caller");
        rows.set(key, row);
      }
      tally(row, call);
    }
    return [...rows.values()].sort((a, b) => b.calls - a.calls);
  }, [inRange]);

  const totals = useMemo(() => {
    const row = blank("total", "Everyone");
    for (const call of inRange) tally(row, call);
    return row;
  }, [inRange]);

  const followUps = useMemo(() => dueFollowUps(calls, today), [calls, today]);

  const nameOf = (call: SalesCall) => call.contactName || leadByContact.get(call.contactId)?.name || call.contactEmail || "Unknown";
  const empty = loading && calls.length === 0 ? "Loading calls…" : "No calls yet";
  const recent = inRange.slice(0, RECENT_LIMIT);

  return (
    <div className="ld-calls">
      <div className="ld-calls-top">
        <div className="ld-live-switch" role="tablist" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r.id} type="button" role="tab" aria-selected={range === r.id} onClick={() => setRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <span className="ld-live-ago">New York time</span>
      </div>

      <section className="ld-live-block">
        <h3>By caller</h3>
        {callers.length === 0 ? (
          <p className="ld-live-empty">{empty}</p>
        ) : (
          <div className="ld-app-table-wrap">
            <table className="ld-app-table ld-calls-table">
              <thead>
                <tr>
                  <th>Caller</th>
                  <th>Calls</th>
                  <th>Connected</th>
                  <th>Connect rate</th>
                  <th>Talk time</th>
                  <th>Avg connected</th>
                  <th>Hot or interested</th>
                  <th>Booked</th>
                </tr>
              </thead>
              <tbody>
                {[...callers, ...(callers.length > 1 ? [totals] : [])].map((row) => (
                  <tr key={row.key} data-total={row.key === "total" ? "true" : undefined}>
                    <td>
                      <b>{row.name}</b>
                    </td>
                    <td>{row.calls}</td>
                    <td>{row.connected}</td>
                    <td>{rate(row)}</td>
                    <td>{formatDuration(row.talkSec)}</td>
                    <td>{avgConnected(row)}</td>
                    <td>{row.hot}</td>
                    <td>{row.booked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ld-live-block">
        <h3>Follow-ups due{followUps.length > 0 ? ` (${followUps.length})` : ""}</h3>
        {followUps.length === 0 ? (
          <p className="ld-live-empty">{calls.length === 0 ? empty : "Nothing due"}</p>
        ) : (
          <div className="ld-calls-rows">
            {followUps.map(({ call, day }) => {
              const lead = leadByContact.get(call.contactId);
              return (
                <div key={call.contactId} className="ld-calls-followup">
                  <span className="ld-calls-followup-day" data-late={day < today ? "true" : undefined}>
                    {day === today ? "Today" : formatDayLabel(day)}
                  </span>
                  <span className="ld-calls-followup-body">
                    <b>{nameOf(call)}</b>
                    <small>{call.summary?.nextStep || call.summary?.summary || ""}</small>
                  </span>
                  <span className="ld-calls-caller">{call.userName}</span>
                  {lead ? (
                    <button type="button" className="ld-calls-open" onClick={() => onOpenLead(lead)}>
                      Open lead
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="ld-live-block">
        <h3>
          Recent calls
          {inRange.length > RECENT_LIMIT ? <span className="ld-calls-sub"> · latest {RECENT_LIMIT} of {inRange.length}</span> : null}
        </h3>
        {recent.length === 0 ? (
          <p className="ld-live-empty">{empty}</p>
        ) : (
          <div className="ld-calls-rows">
            {recent.map((call) => {
              const lead = leadByContact.get(call.contactId);
              const body = (
                <>
                  <span className="ld-calls-when">{formatCallStamp(call.startedAt)}</span>
                  <span className="ld-calls-who">{nameOf(call)}</span>
                  <span className="ld-calls-caller">{call.userName}</span>
                  <span className="ld-calls-dur">{formatDuration(call.durationSec)}</span>
                  <OutcomeChip call={call} />
                  <span className="ld-calls-text">{call.summary?.summary ?? ""}</span>
                </>
              );
              return lead ? (
                <button key={call.messageId} type="button" className="ld-calls-row" onClick={() => onOpenLead(lead)}>
                  {body}
                </button>
              ) : (
                <div key={call.messageId} className="ld-calls-row" data-static="true">
                  {body}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showCommissions && <CommissionsSection />}
    </div>
  );
}
