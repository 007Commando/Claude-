"use client";

/**
 * The drawer's Calls section: every sales call with this lead, newest first.
 * The list the desk already loaded shows at once; opening the drawer then
 * asks for this contact's calls again to get the transcripts. While the
 * backend job is not deployed the endpoints answer 404, which arrives here
 * as an empty list, so the section just says "No calls yet".
 */

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Lead } from "../../../lib/leads/model";
import {
  CALL_INTEREST_LABELS,
  CALL_SELLER_TYPE_LABELS,
  formatCallStamp,
  formatClock,
  formatDayLabel,
  followUpDay,
  formatDuration,
  type SalesCall,
} from "../../../lib/leads/calls";
import { apiUrl } from "./shared";
import { OutcomeChip } from "./callUi";

function Transcript({ call, loading }: { call: SalesCall; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const lines = call.transcript ?? null;
  // Channels count from 0 or 1 depending on the phone system: Speaker 1 is whoever has the lowest.
  const first = lines && lines.length > 0 ? Math.min(...lines.map((l) => l.channel)) : 0;
  return (
    <div className="ld-calls-transcript">
      <button type="button" className="ld-calls-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Transcript
      </button>
      {open &&
        (lines ? (
          lines.length === 0 ? (
            <p className="ld-calls-note">Nothing was picked up.</p>
          ) : (
            <div className="ld-calls-lines">
              {lines.map((line, i) => (
                <div key={i} className="ld-calls-line">
                  <span className="ld-calls-line-time">{formatClock(line.startMs)}</span>
                  <span>
                    <b>Speaker {line.channel - first + 1}:</b> {line.text}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="ld-calls-note">{loading ? "Loading transcript…" : "Transcript not available."}</p>
        ))}
    </div>
  );
}

function CallCard({ call, loading }: { call: SalesCall; loading: boolean }) {
  const s = call.summary;
  const followUp = followUpDay(s?.followUpDate);
  return (
    <div className="ld-calls-card">
      <div className="ld-calls-card-top">
        <span className="ld-calls-card-when">{formatCallStamp(call.startedAt)}</span>
        <span className="ld-calls-card-meta">
          {call.userName || "Unknown caller"} · {formatDuration(call.durationSec)}
        </span>
        <OutcomeChip call={call} />
        {s && (
          <span className="ld-calls-chip" data-interest={s.interest}>
            {CALL_INTEREST_LABELS[s.interest]}
          </span>
        )}
      </div>

      {s ? (
        <>
          <p className="ld-calls-summary">{s.summary}</p>
          {s.sellerType !== "unknown" && <p className="ld-calls-line-item">Seller: {CALL_SELLER_TYPE_LABELS[s.sellerType]}</p>}
          {s.objection && <p className="ld-calls-line-item">Objection: {s.objection}</p>}
          {s.nextStep && <p className="ld-calls-line-item">Next step: {s.nextStep}</p>}
          {followUp && <p className="ld-calls-line-item">Follow-up: {formatDayLabel(followUp)}</p>}
        </>
      ) : call.summaryStatus === "no-key" ? (
        <p className="ld-calls-note">AI notes not switched on yet</p>
      ) : call.summaryStatus === "pending" ? (
        <p className="ld-calls-note">AI notes processing…</p>
      ) : call.summaryStatus === "error" ? (
        <p className="ld-calls-note">AI notes unavailable</p>
      ) : null}

      {call.transcriptStatus === "none" ? (
        <p className="ld-calls-note">No recording</p>
      ) : (
        <>
          <audio
            className="ld-calls-audio"
            controls
            preload="none"
            src={apiUrl(`/api/leads/calls/${encodeURIComponent(call.messageId)}/recording`)}
          />
          {call.transcriptStatus === "pending" ? (
            <p className="ld-calls-note">Transcript processing…</p>
          ) : call.transcriptStatus === "error" ? (
            <p className="ld-calls-note">Transcript unavailable</p>
          ) : (
            <Transcript call={call} loading={loading} />
          )}
        </>
      )}
    </div>
  );
}

export default function CallsSection({ lead, listed }: { lead: Lead; listed: SalesCall[] }) {
  const contactId = lead.ghlLocation === "apex" ? lead.ghlContactId : null;
  const [full, setFull] = useState<{ contactId: string; calls: SalesCall[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) return;
    let cancelled = false;
    setLoading(true);
    fetch(apiUrl(`/api/leads/calls?contactId=${encodeURIComponent(contactId)}`), { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { calls: [] }))
      .then((json: { calls?: SalesCall[] }) => {
        if (!cancelled) setFull({ contactId, calls: Array.isArray(json.calls) ? json.calls : [] });
      })
      .catch((error) => {
        console.warn("[sales-calls] could not load this contact's calls", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contactId]);

  const withTranscripts = full && full.contactId === contactId && full.calls.length > 0 ? full.calls : null;
  const calls = withTranscripts ?? listed;

  return (
    <div className="ld-drawer-section ld-calls-section">
      <div className="ld-drawer-section-title">Calls{calls.length > 0 ? ` (${calls.length})` : ""}</div>
      {calls.length === 0 ? (
        <p className="ld-calls-note">No calls yet</p>
      ) : (
        <div className="ld-calls-list">
          {calls.map((call) => (
            <CallCard key={call.messageId} call={call} loading={loading && !withTranscripts} />
          ))}
        </div>
      )}
    </div>
  );
}
