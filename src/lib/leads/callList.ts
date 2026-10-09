/**
 * Today's call queue for a sales rep. Pure: Lead Desk's leads and calls go in,
 * three ordered groups come out. See the Call list view for how it shows.
 */

import { callsForLead, type SalesCall } from "./calls";
import type { Lead } from "./model";

export type CallGroupId = "trials" | "accounts" | "leads";

export interface CallListRow {
  lead: Lead;
  /** Furthest in-app milestone, 0 (nothing) to 4 (Seller Central). Only used to order the no-trial accounts. */
  rank: number;
  /** Whole days until the trial ends, for the trials group. */
  trialDaysLeft: number | null;
  /** The signup date for accounts, the lead date for CRM leads. */
  since: string;
  lastCall: SalesCall | null;
}

export interface CallGroup {
  id: CallGroupId;
  title: string;
  rows: CallListRow[];
}

const DAY_MS = 86_400_000;
const TRIAL_WINDOW_DAYS = 7;
const LEAD_WINDOW_DAYS = 30;
const RECENT_CALL_DAYS = 2;

export const CALL_GROUP_TITLES: Record<CallGroupId, string> = {
  trials: "Trials ending soon",
  accounts: "Accounts with no trial",
  leads: "CRM leads with no account",
};

/** How far into the product they got: Seller Central, then database products, then a first scan, then the vendor email. */
export function activationRank(a: Lead["activation"]): number {
  if (a.amazonConnectedAt) return 4;
  if (a.databaseProducts > 0) return 3;
  if (a.firstScanAt) return 2;
  if (a.vendorEmailSent) return 1;
  return 0;
}

const time = (iso: string | null): number => {
  if (!iso) return NaN;
  return new Date(iso).getTime();
};

const newestFirst = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0);

/**
 * Builds the three groups. `today` is the New York calendar day (YYYY-MM-DD),
 * used to drop anyone already marked `outreach:<today>`.
 */
export function buildCallList(
  leads: Lead[],
  callsByContact: Record<string, SalesCall[]> | undefined,
  today: string,
  now: number = Date.now(),
): CallGroup[] {
  const recentCallCutoff = now - RECENT_CALL_DAYS * DAY_MS;
  const outreachTag = `outreach:${today}`;

  const trials: CallListRow[] = [];
  const accounts: CallListRow[] = [];
  const crm: CallListRow[] = [];

  for (const lead of leads) {
    if (lead.internal || lead.grade === "C") continue;
    if (lead.tags.includes(outreachTag)) continue;
    const calls = callsForLead(lead, callsByContact);
    const lastCall = calls[0] ?? null;
    if (lastCall && time(lastCall.startedAt) >= recentCallCutoff) continue;

    if (lead.stage === "trial") {
      const end = time(lead.trialEndsAt);
      if (Number.isNaN(end) || end < now || end > now + TRIAL_WINDOW_DAYS * DAY_MS) continue;
      trials.push({
        lead,
        rank: activationRank(lead.activation),
        trialDaysLeft: Math.max(0, Math.ceil((end - now) / DAY_MS)),
        since: lead.registeredAt ?? lead.trialStartedAt ?? lead.leadAt,
        lastCall,
      });
    } else if (lead.stage === "registered") {
      accounts.push({ lead, rank: activationRank(lead.activation), trialDaysLeft: null, since: lead.registeredAt ?? lead.leadAt, lastCall });
    } else if (lead.stage === "lead" && lead.ghlLocation === "apex") {
      const at = time(lead.leadAt);
      if (Number.isNaN(at) || at < now - LEAD_WINDOW_DAYS * DAY_MS) continue;
      crm.push({ lead, rank: 0, trialDaysLeft: null, since: lead.leadAt, lastCall });
    }
  }

  trials.sort((a, b) => (time(a.lead.trialEndsAt) as number) - (time(b.lead.trialEndsAt) as number));
  accounts.sort((a, b) => b.rank - a.rank || newestFirst(a.since, b.since));
  crm.sort((a, b) => newestFirst(a.since, b.since));

  return [
    { id: "trials", title: CALL_GROUP_TITLES.trials, rows: trials },
    { id: "accounts", title: CALL_GROUP_TITLES.accounts, rows: accounts },
    { id: "leads", title: CALL_GROUP_TITLES.leads, rows: crm },
  ];
}
