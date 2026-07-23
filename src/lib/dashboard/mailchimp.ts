import type { MailchimpMetrics } from "./types";

interface MailchimpList {
  id: string;
  stats: { member_count: number; open_rate?: number; click_rate?: number };
}

interface MailchimpGrowthEntry {
  month: string;
  existing: number;
  imports: number;
  optins: number;
}

interface MailchimpReport {
  id: string;
  campaign_title: string;
  send_time?: string;
  opens: { open_rate: number };
  clicks: { click_rate: number };
}

function serverPrefixFromKey(apiKey: string): string | null {
  const parts = apiKey.split("-");
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

async function mcFetch<T>(path: string, apiKey: string, serverPrefix: string): Promise<T> {
  const res = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`apikey:${apiKey}`).toString("base64")}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mailchimp ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function getMailchimpMetrics(): Promise<MailchimpMetrics> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const empty: MailchimpMetrics = {
    connected: false,
    totalSubscribers: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    subscribers30d: 0,
    recentCampaigns: [],
  };

  if (!apiKey) {
    return { ...empty, error: "MAILCHIMP_API_KEY is not set" };
  }

  const serverPrefix = serverPrefixFromKey(apiKey);
  if (!serverPrefix) {
    return { ...empty, error: "MAILCHIMP_API_KEY is missing its datacenter suffix (e.g. ...-us21)" };
  }

  try {
    const listsRes = await mcFetch<{ lists: MailchimpList[] }>("/lists?count=50", apiKey, serverPrefix);

    const totalSubscribers = listsRes.lists.reduce((sum, l) => sum + l.stats.member_count, 0);
    const listsWithRates = listsRes.lists.filter((l) => typeof l.stats.open_rate === "number");
    const avgOpenRate = listsWithRates.length
      ? listsWithRates.reduce((sum, l) => sum + (l.stats.open_rate ?? 0), 0) / listsWithRates.length
      : 0;
    const avgClickRate = listsWithRates.length
      ? listsWithRates.reduce((sum, l) => sum + (l.stats.click_rate ?? 0), 0) / listsWithRates.length
      : 0;

    const growthHistories = await Promise.all(
      listsRes.lists.map((l) =>
        mcFetch<{ history: MailchimpGrowthEntry[] }>(
          `/lists/${l.id}/growth-history?count=1&sort_field=month&sort_dir=DESC`,
          apiKey,
          serverPrefix,
        ).catch(() => ({ history: [] as MailchimpGrowthEntry[] })),
      ),
    );
    const subscribers30d = growthHistories.reduce((sum, h) => {
      const latest = h.history[0];
      return sum + (latest ? latest.optins + latest.imports : 0);
    }, 0);

    const reportsRes = await mcFetch<{ reports: MailchimpReport[] }>(
      "/reports?count=8&sort_field=send_time&sort_dir=DESC",
      apiKey,
      serverPrefix,
    );

    return {
      connected: true,
      totalSubscribers,
      avgOpenRate,
      avgClickRate,
      subscribers30d,
      recentCampaigns: reportsRes.reports.map((r) => ({
        id: r.id,
        title: r.campaign_title,
        sentAt: r.send_time ?? null,
        openRate: r.opens.open_rate,
        clickRate: r.clicks.click_rate,
      })),
    };
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : "Failed to reach Mailchimp" };
  }
}
