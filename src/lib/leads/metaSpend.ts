/**
 * Ad-level Meta spend for a date range. dashboard/meta.ts only rolls spend up
 * to the account and campaign, but pairing spend with customers needs it per
 * ad (and its adset and campaign) so cost per customer can be read at any level.
 */

export interface AdSpendRow {
  /** The day this row covers, YYYY-MM-DD in the ad account's time zone. */
  date: string;
  campaignId: string;
  campaignName: string;
  adsetId: string;
  adsetName: string;
  adId: string;
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
}

const GRAPH_VERSION = "v21.0";
const CACHE_MS = 15 * 60 * 1000;

interface MetaAdInsight {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  date_start?: string;
  spend?: string;
  impressions?: string;
  inline_link_clicks?: string;
}

interface MetaInsightsPage {
  data?: MetaAdInsight[];
  paging?: { next?: string };
  error?: { message?: string };
}

const cache = new Map<string, { at: number; rows: AdSpendRow[] }>();

/**
 * Spend, impressions and link clicks per ad per day between two YYYY-MM-DD dates
 * (inclusive). Cached for 15 minutes per range. Never throws: missing env vars
 * or an API error (an expired or deleted app token, for one) come back as
 * `error` with no rows.
 */
export async function getMetaAdSpend(
  since: string,
  until: string,
  fresh = false,
): Promise<{ rows: AdSpendRow[]; error?: string }> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const rawAccountId = process.env.META_AD_ACCOUNT_ID;
  if (!accessToken || !rawAccountId) return { rows: [], error: "Meta spend not configured" };

  const key = `${since}|${until}`;
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return { rows: hit.rows };

  const accountId = rawAccountId.replace(/^act_/, "");

  try {
    const first = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/act_${accountId}/insights`);
    first.searchParams.set("level", "ad");
    first.searchParams.set(
      "fields",
      "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,inline_link_clicks",
    );
    first.searchParams.set("time_range", JSON.stringify({ since, until }));
    // One row per ad per day, so spend can be split into the weeks leads arrived in.
    first.searchParams.set("time_increment", "1");
    first.searchParams.set("limit", "500");
    first.searchParams.set("access_token", accessToken);

    const rows: AdSpendRow[] = [];
    // paging.next is a complete URL carrying the token and cursor, so it is followed as given.
    let next: string | undefined = first.toString();
    while (next) {
      const res: Response = await fetch(next, { cache: "no-store" });
      const json = (await res.json()) as MetaInsightsPage;
      if (!res.ok || json.error) {
        return { rows: [], error: json.error?.message ?? `Meta insights failed: ${res.status}` };
      }
      for (const r of json.data ?? []) {
        rows.push({
          date: r.date_start ?? since,
          campaignId: r.campaign_id ?? "",
          campaignName: r.campaign_name ?? "",
          adsetId: r.adset_id ?? "",
          adsetName: r.adset_name ?? "",
          adId: r.ad_id ?? "",
          adName: r.ad_name ?? "",
          spend: Number(r.spend ?? 0),
          impressions: Number(r.impressions ?? 0),
          clicks: Number(r.inline_link_clicks ?? 0),
        });
      }
      next = json.paging?.next;
    }

    cache.set(key, { at: Date.now(), rows });
    return { rows };
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : "Failed to reach Meta Marketing API" };
  }
}
