"use client";

/**
 * The Call list view: today's queue for the sales rep, in three groups
 * (trials about to end, accounts that never started a trial, CRM leads with no
 * account), each ordered so the best call is first. The rules live in
 * src/lib/leads/callList.ts.
 */

import { useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { activationTier, isHotLead, type Lead } from "../../../lib/leads/model";
import { buildCallList, type CallGroup, type CallListRow } from "../../../lib/leads/callList";
import { formatDuration, sinceLabel, type SalesCall } from "../../../lib/leads/calls";
import { ACTIVATION_LABELS, SELLER_TYPE_LABELS, SOURCE_LABELS, daysBetween, todayNY } from "./shared";

const GROUP_CAP = 50;

function milestone(lead: Lead): string {
  const tier = activationTier(lead.activation);
  return tier ? ACTIVATION_LABELS[tier] : "Nothing yet";
}

function sinceText(row: CallListRow): string {
  const days = daysBetween(row.since);
  if (days == null) return "–";
  return days <= 0 ? "today" : `${days}d ago`;
}

function lastCallText(call: SalesCall | null): string {
  if (!call) return "Not called";
  const since = sinceLabel(call.startedAt);
  return `${since === "now" ? "just now" : `${since} ago`} · ${formatDuration(call.durationSec)}`;
}

function Group({ group, onOpenLead }: { group: CallGroup; onOpenLead: (lead: Lead) => void }) {
  const [all, setAll] = useState(false);
  const shown = all ? group.rows : group.rows.slice(0, GROUP_CAP);
  const sinceHeading = group.id === "leads" ? "Lead" : "Signed up";

  return (
    <section className="ld-live-block ld-cl-group">
      <h3>
        {group.title} <span className="ld-cl-count">{group.rows.length}</span>
      </h3>
      {group.rows.length === 0 ? (
        <p className="ld-live-empty">Nobody to call here</p>
      ) : (
        <>
          <div className="ld-app-table-wrap">
            <table className="ld-app-table ld-cl-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Phone</th>
                  <th>Seller type</th>
                  <th>Reached</th>
                  <th>{sinceHeading}</th>
                  <th>Last call</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => {
                  const { lead } = row;
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="ld-cl-name">
                          {isHotLead(lead) && <Star size={13} className="ld-hot-star" aria-label="Hot lead" />}
                          <b>{lead.name}</b>
                          {row.trialDaysLeft != null && (
                            <span className="ld-cl-ends" data-soon={row.trialDaysLeft <= 2 ? "true" : undefined}>
                              {row.trialDaysLeft === 0 ? "ends today" : `ends in ${row.trialDaysLeft}d`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{SOURCE_LABELS[lead.source]}</td>
                      <td>
                        {lead.phone ? (
                          <a className="ld-cl-phone" href={`tel:${lead.phone}`}>
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="ld-cl-none">No phone</span>
                        )}
                      </td>
                      <td>{SELLER_TYPE_LABELS[lead.sellerType]}</td>
                      <td>{milestone(lead)}</td>
                      <td>{sinceText(row)}</td>
                      <td className={row.lastCall ? undefined : "ld-cl-none"}>{lastCallText(row.lastCall)}</td>
                      <td>
                        <div className="ld-cl-actions">
                          <button type="button" className="ld-btn" onClick={() => onOpenLead(lead)}>
                            Open
                          </button>
                          {lead.ghlUrl && (
                            <a className="ld-cl-ghl" href={lead.ghlUrl} target="_blank" rel="noreferrer">
                              Open in GHL <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {group.rows.length > GROUP_CAP && (
            <button type="button" className="ld-btn ld-cl-more" onClick={() => setAll((v) => !v)}>
              {all ? "Show fewer" : `Show more (${group.rows.length - GROUP_CAP} more)`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default function CallListView({
  leads,
  callsByContact,
  onOpenLead,
}: {
  leads: Lead[];
  callsByContact: Record<string, SalesCall[]>;
  onOpenLead: (lead: Lead) => void;
}) {
  const groups = useMemo(() => buildCallList(leads, callsByContact, todayNY()), [leads, callsByContact]);
  const total = groups.reduce((sum, g) => sum + g.rows.length, 0);

  return (
    <div className="ld-cl">
      <div className="ld-cl-top">
        <b className="ld-cl-total">{total} to call today</b>
        <span className="ld-live-ago">Skips grade C, anyone called in the last 2 days or marked contacted today</span>
      </div>
      {groups.map((group) => (
        <Group key={group.id} group={group} onOpenLead={onOpenLead} />
      ))}
    </div>
  );
}
