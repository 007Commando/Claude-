import type { Lead } from "../../../lib/leads/model";

/**
 * The path one person took across the board (Stefano, 2026-10-08): each step
 * is a column they passed through, with the day they got there, numbered in
 * the order it happened. Built from the lead's own touches (every GHL contact,
 * the account, the trial, paying, cancelling) and the dated activation
 * milestones, so it is the same history the drawer's Journey shows.
 */

export interface JourneyStep {
  /** The board column the step belongs to, matching the column ids in Board.tsx. */
  colId: string;
  label: string;
  detail: string | null;
  at: string;
}

const TOUCH_COL: Record<"account" | "trial" | "customer" | "churned", string> = {
  account: "registered",
  trial: "trial",
  customer: "customer",
  churned: "churned",
};

export function journeySteps(lead: Lead): JourneyStep[] {
  const byCol = new Map<string, JourneyStep>();
  const keep = (step: JourneyStep) => {
    const prev = byCol.get(step.colId);
    // A column visited twice (two GHL contacts, say) keeps its first visit.
    if (!prev || step.at < prev.at) byCol.set(step.colId, step);
  };

  for (const t of lead.touches ?? []) {
    if (!t.at) continue;
    if (t.kind === "lead") {
      keep(
        t.channel === "primewell"
          ? { colId: "primewell", label: "Applied on PrimeWell", detail: t.detail, at: t.at }
          : { colId: "lead", label: t.label, detail: t.detail, at: t.at },
      );
    } else {
      keep({ colId: TOUCH_COL[t.kind], label: t.label, detail: t.detail, at: t.at });
    }
  }
  // Fallbacks for leads whose touches miss a stage the record itself has.
  if (lead.registeredAt) keep({ colId: "registered", label: "Created Apex account", detail: null, at: lead.registeredAt });
  if (lead.trialStartedAt) keep({ colId: "trial", label: "Started trial", detail: lead.planName, at: lead.trialStartedAt });
  if (lead.customerSince) keep({ colId: "customer", label: "Became a paying customer", detail: lead.planName, at: lead.customerSince });
  if (lead.churnedAt) keep({ colId: "churned", label: "Cancelled", detail: lead.churnReason, at: lead.churnedAt });
  if (lead.activation.firstScanAt) keep({ colId: "act:scan", label: "First supplier scan", detail: null, at: lead.activation.firstScanAt });
  if (lead.activation.amazonConnectedAt)
    keep({ colId: "act:amazon", label: "Connected Amazon", detail: null, at: lead.activation.amazonConnectedAt });

  return [...byCol.values()].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
}

/** "3d 4h", "45m": the gap between two steps. */
export function gap(fromIso: string, toIso: string): string {
  const ms = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime());
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h${m % 60 ? ` ${m % 60}m` : ""}`;
  const d = Math.floor(h / 24);
  return `${d}d${h % 24 ? ` ${h % 24}h` : ""}`;
}

export const stepDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
