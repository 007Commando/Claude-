import type { MetaMetrics } from "./types";

const GRAPH_VERSION = "v21.0";

interface MetaInsightRow {
  spend?: string;
  impressions?: string;
  clicks?: string;
  cpc?: string;
  campaign_id?: string;
  campaign_name?: string;
}

function isoDate(msAgo: number): string {
  return new Date(Date.now() - msAgo).toISOString().slice(0, 10);
}

async function metaFetch(path: string, accessToken: string, params: Record<string, string>) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Meta ${path} failed: ${json.error?.message ?? res.status}`);
  }
  return json as { data: MetaInsightRow[] };
}

export async function getMetaMetrics(): Promise<MetaMetrics> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const rawAccountId = process.env.META_AD_ACCOUNT_ID;
  const empty: MetaMetrics = {
    connected: false,
    spend7d: 0,
    spend30d: 0,
    impressions30d: 0,
    clicks30d: 0,
    cpc30d: 0,
    campaigns: [],
  };

  if (!accessToken || !rawAccountId) {
    return { ...empty, error: "META_ACCESS_TOKEN or META_AD_ACCOUNT_ID is not set" };
  }

  const accountId = rawAccountId.startsWith("act_") ? rawAccountId : `act_${rawAccountId}`;
  const day = 24 * 60 * 60 * 1000;

  try {
    const timeRange7d = JSON.stringify({ since: isoDate(7 * day), until: isoDate(0) });
    const timeRange30d = JSON.stringify({ since: isoDate(30 * day), until: isoDate(0) });

    const [account7d, account30d, campaigns30d] = await Promise.all([
      metaFetch(`/${accountId}/insights`, accessToken, {
        fields: "spend",
        time_range: timeRange7d,
      }),
      metaFetch(`/${accountId}/insights`, accessToken, {
        fields: "spend,impressions,clicks,cpc",
        time_range: timeRange30d,
      }),
      metaFetch(`/${accountId}/insights`, accessToken, {
        fields: "campaign_id,campaign_name,spend,clicks,impressions",
        level: "campaign",
        time_range: timeRange30d,
        limit: "50",
      }),
    ]);

    const row30d = account30d.data[0];
    const row7d = account7d.data[0];

    return {
      connected: true,
      spend7d: row7d ? Number(row7d.spend ?? 0) : 0,
      spend30d: row30d ? Number(row30d.spend ?? 0) : 0,
      impressions30d: row30d ? Number(row30d.impressions ?? 0) : 0,
      clicks30d: row30d ? Number(row30d.clicks ?? 0) : 0,
      cpc30d: row30d ? Number(row30d.cpc ?? 0) : 0,
      campaigns: campaigns30d.data.map((c) => ({
        id: c.campaign_id ?? "",
        name: c.campaign_name ?? "Unnamed campaign",
        spend: Number(c.spend ?? 0),
        clicks: Number(c.clicks ?? 0),
        impressions: Number(c.impressions ?? 0),
      })),
    };
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : "Failed to reach Meta Marketing API" };
  }
}
