"use client";

import { useEffect, useState } from "react";
import type { Lead, LeadSource } from "../../../lib/leads/model";
import type { JourneyEvent } from "../../../lib/leads/journey";
import { SOURCE_LABELS, fmtDate, fmtDuration, spanMs } from "./shared";
import SourceLogo from "./SourceLogo";

interface Step {
  at: string | null;
  title: string;
  channel: LeadSource | null;
  details: string[];
  milestone: boolean;
}

/**
 * Everything this person has done with us, oldest first: each time they came
 * in (from GHL's own records, fetched when the drawer opens), then the
 * account, trial and payment. Answers "where did they first come from, and
 * what finally converted them".
 */
export default function LeadJourney({ lead }: { lead: Lead }) {
  const [events, setEvents] = useState<JourneyEvent[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setEvents(null);
    setFailed(false);
    if (!lead.email) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/leads/journey?email=${encodeURIComponent(lead.email)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { events: JourneyEvent[] }) => !cancelled && setEvents(d.events))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [lead.email]);

  // GHL's records replace the board's own "came in" touches once they load:
  // they are the same contacts, with the visits and form submissions added.
  const ghlSteps: Step[] =
    events && events.length > 0
      ? events.map((e) => ({ at: e.at, title: e.title, channel: e.channel, details: e.details, milestone: false }))
      : lead.touches
          .filter((t) => t.kind === "lead")
          .map((t) => ({ at: t.at, title: t.label, channel: t.channel, details: t.detail ? [t.detail] : [], milestone: false }));
  const milestones: Step[] = lead.touches
    .filter((t) => t.kind !== "lead")
    .map((t) => ({
      at: t.at,
      title: t.label,
      channel: t.channel,
      details: t.detail ? [t.detail] : [],
      milestone: true,
    }));
  const steps = [...ghlSteps, ...milestones].sort((a, b) => {
    if (!a.at && !b.at) return 0;
    if (!a.at) return 1;
    if (!b.at) return -1;
    return a.at < b.at ? -1 : a.at > b.at ? 1 : 0;
  });

  return (
    <div className="ld-drawer-section">
      <div className="ld-drawer-section-title">Journey</div>
      <div className="ld-journey-summary">
        <span>
          First came from <strong>{SOURCE_LABELS[lead.firstSource]}</strong>
        </span>
        {lead.convertedVia && (
          <span>
            Converted via <strong>{SOURCE_LABELS[lead.convertedVia]}</strong>
            {lead.convertedViaDetail ? ` (${lead.convertedViaDetail})` : ""}
          </span>
        )}
      </div>
      <div className="ld-timeline">
        {steps.map((step, i) => {
          const prev = steps
            .slice(0, i)
            .reverse()
            .find((s) => s.at)?.at;
          const ms = step.at ? spanMs(prev ?? null, step.at) : null;
          return (
            <div key={`${step.title}-${step.at}-${i}`} className="ld-timeline-step" data-reached="true">
              <div className="ld-timeline-dot-col">
                <div className="ld-timeline-dot" data-milestone={step.milestone} />
                {i < steps.length - 1 && <div className="ld-timeline-line" />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="ld-timeline-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {step.channel && <SourceLogo source={step.channel} />}
                  {step.title}
                </div>
                <div className="ld-timeline-date">
                  {step.at ? fmtDate(step.at) : "Date not recorded"}
                  {ms != null && ms > 0 && (
                    <span className="ld-time-tag ld-time-tag-jump" style={{ marginLeft: 6 }}>
                      +{fmtDuration(ms)}
                    </span>
                  )}
                </div>
                {step.details.map((d) => (
                  <div key={d} className="ld-journey-detail">
                    {d}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {events === null && !failed && <p className="ld-journey-note">Loading the full history from GHL…</p>}
      {failed && <p className="ld-journey-note">Couldn't load GHL's history; showing what the board knows.</p>}
    </div>
  );
}
