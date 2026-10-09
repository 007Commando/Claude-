"use client";

import { X } from "lucide-react";
import type { Lead, Stage } from "../../../lib/leads/model";

/**
 * "Since you last looked" (Stefano, 2026-10-08): every time Lead Desk loads,
 * compare each person's stage with what this browser saw last time, say what
 * moved, and let the cards that moved pulse once. The snapshot is per browser
 * (localStorage), so Stefano and Aliza each see their own changes.
 */

const KEY = "leadDesk.lastSeen.v1";

export interface Changes {
  /** When the previous snapshot was taken. */
  since: string;
  newLeads: Lead[];
  moved: { lead: Lead; from: Stage; to: Stage }[];
}

const counts = (l: Lead) => !l.internal && !(l.source === "ash" && l.stage === "lead");

/** Diff against the stored snapshot, then store the current one. Null on a first visit. */
export function takeChanges(leads: Lead[]): Changes | null {
  const now: Record<string, Stage> = {};
  for (const l of leads) if (counts(l)) now[l.id] = l.stage;

  let prev: { at: string; stages: Record<string, Stage> } | null = null;
  try {
    prev = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
  } catch {
    prev = null;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ at: new Date().toISOString(), stages: now }));
  } catch {
    // Storage full or blocked: the banner just won't have a baseline next time.
  }
  if (!prev?.stages) return null;

  const newLeads: Lead[] = [];
  const moved: Changes["moved"] = [];
  for (const l of leads) {
    if (!counts(l)) continue;
    const before = prev.stages[l.id];
    if (!before) newLeads.push(l);
    else if (before !== l.stage) moved.push({ lead: l, from: before, to: l.stage });
  }
  return { since: prev.at, newLeads, moved };
}

export function changedIds(c: Changes | null): Set<string> {
  return new Set([...(c?.newLeads ?? []).map((l) => l.id), ...(c?.moved ?? []).map((m) => m.lead.id)]);
}

function ago(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)} days ago`;
}

const GROUPS: { to: Stage; one: string; many: string }[] = [
  { to: "customer", one: "new customer", many: "new customers" },
  { to: "trial", one: "new trial", many: "new trials" },
  { to: "registered", one: "new account", many: "new accounts" },
  { to: "churned", one: "cancellation", many: "cancellations" },
];

export default function ChangesBanner({
  changes,
  onOpenLead,
  onDismiss,
}: {
  changes: Changes;
  onOpenLead: (lead: Lead) => void;
  onDismiss: () => void;
}) {
  const parts = GROUPS.map((g) => ({ g, items: changes.moved.filter((m) => m.to === g.to) })).filter((p) => p.items.length);
  const nothing = changes.newLeads.length === 0 && parts.length === 0;

  return (
    <div className="ld-changes" role="status">
      <span className="ld-changes-since">Since you last looked, {ago(changes.since)}:</span>
      {nothing && <span className="ld-changes-quiet">nothing has moved.</span>}
      {parts.map(({ g, items }) => (
        <span key={g.to} className="ld-changes-item" data-stage={g.to}>
          <strong>
            {items.length} {items.length === 1 ? g.one : g.many}
          </strong>
          {items.slice(0, 3).map(({ lead }) => (
            <button key={lead.id} type="button" onClick={() => onOpenLead(lead)}>
              {lead.name || lead.email}
            </button>
          ))}
          {items.length > 3 && <span className="ld-changes-more">+{items.length - 3}</span>}
        </span>
      ))}
      {changes.newLeads.length > 0 && (
        <span className="ld-changes-item" data-stage="lead">
          <strong>
            {changes.newLeads.length} new lead{changes.newLeads.length === 1 ? "" : "s"}
          </strong>
        </span>
      )}
      <button type="button" className="ld-icon-btn ld-changes-close" aria-label="Dismiss" onClick={onDismiss}>
        <X size={13} />
      </button>
    </div>
  );
}
