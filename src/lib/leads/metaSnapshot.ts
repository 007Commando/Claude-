import type { MetaAd, MetaAdsPayload, MetaAdset, MetaCampaign, MetaDelivery } from "./metaAds";

/**
 * Meta data without a Meta token (Stefano, 2026-10-10).
 *
 * Stefano's Facebook profile is barred from Meta for Developers, so the
 * business owns no app that can mint a Marketing API token, and the old one
 * died with its app. The Meta Ads connector in his Claude sessions can still
 * read the ad account, so a scheduled routine pulls campaigns, ad sets, ads,
 * creatives and per-ad daily delivery through it and stores them on the Apex
 * backend (/internal/marketing/meta-snapshot). This reads that snapshot and
 * adds up any date range the Facebook ads tab asks for, in the same shape the
 * live Marketing API path returns, so nothing downstream knows the difference
 * beyond `source`.
 *
 * The writer is scripts/meta-snapshot/push.mjs.
 */

/** [adId, YYYY-MM-DD, spend, impressions, reach, link clicks, Meta-counted leads] */
export type MetaDailyRow = [string, string, number, number, number, number, number];

export interface MetaSnapshot {
  /** When the routine last pulled from Meta. */
  fetchedAt: string;
  campaigns: MetaCampaign[];
  adsets: MetaAdset[];
  ads: Omit<MetaAd, "delivery">[];
  daily: MetaDailyRow[];
}

const BASE_URL = process.env.APEX_API_URL ?? "https://app.apexapplications.io/api";
const CACHE_MS = 5 * 60 * 1000;
let cached: { at: number; snapshot: MetaSnapshot | null } | null = null;

export async function readMetaSnapshot(fresh = false): Promise<MetaSnapshot | null> {
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.snapshot;
  const key = process.env.APEX_INTERNAL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE_URL}/internal/marketing/meta-snapshot?apiKey=${encodeURIComponent(key)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { snapshot?: MetaSnapshot | null };
    const snapshot = json.snapshot && Array.isArray(json.snapshot.daily) ? json.snapshot : null;
    cached = { at: Date.now(), snapshot };
    return snapshot;
  } catch {
    return null;
  }
}

const EMPTY: MetaDelivery = { spend: 0, impressions: 0, reach: 0, clicks: 0, metaLeads: 0 };

/**
 * The period's delivery per ad, summed from the daily rows. Reach is summed
 * too, which overstates it a little across days (the same person seen on two
 * days counts twice); the tab only shows it per ad, never as a headline.
 */
export function payloadFromSnapshot(snapshot: MetaSnapshot, since: string, until: string): MetaAdsPayload {
  const delivery = new Map<string, MetaDelivery>();
  for (const [adId, date, spend, impressions, reach, clicks, leads] of snapshot.daily) {
    if (date < since || date > until) continue;
    const d = delivery.get(adId) ?? { ...EMPTY };
    d.spend += Number(spend) || 0;
    d.impressions += Number(impressions) || 0;
    d.reach += Number(reach) || 0;
    d.clicks += Number(clicks) || 0;
    d.metaLeads += Number(leads) || 0;
    delivery.set(adId, d);
  }
  for (const d of delivery.values()) d.spend = Math.round(d.spend * 100) / 100;

  return {
    since,
    until,
    campaigns: snapshot.campaigns,
    adsets: snapshot.adsets,
    ads: snapshot.ads.map((a) => ({ ...a, delivery: delivery.get(a.id) ?? EMPTY })),
    source: "snapshot",
    snapshotAt: snapshot.fetchedAt,
  };
}
