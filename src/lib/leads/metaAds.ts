/**
 * Everything Lead Desk's Facebook ads tab shows from Meta: each campaign, its
 * ad sets (budget and audience) and its ads, with the creative people actually
 * saw (picture or video thumbnail, primary text, headline, button) and the
 * period's delivery (spend, impressions, CPM, link clicks).
 *
 * Needs META_ACCESS_TOKEN with ads_read on META_AD_ACCOUNT_ID. Never throws:
 * a missing or dead token comes back as `error` so the tab can say so and
 * still show what the CRM knows.
 */

const GRAPH = "https://graph.facebook.com/v21.0";
const CACHE_MS = 15 * 60 * 1000;

export type AdFormat = "image" | "video" | "carousel" | "unknown";

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string | null;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  startTime: string | null;
  stopTime: string | null;
}

export interface MetaAdset {
  id: string;
  campaignId: string;
  name: string;
  status: string;
  dailyBudget: number | null;
  optimizationGoal: string | null;
  /** Plain-language audience lines: places, ages, interests, custom and lookalike audiences. */
  audience: string[];
}

export interface MetaCreative {
  format: AdFormat;
  /** Primary text above the picture. */
  body: string | null;
  headline: string | null;
  description: string | null;
  cta: string | null;
  link: string | null;
  imageUrl: string | null;
  pageName: string | null;
  pagePicture: string | null;
}

export interface MetaDelivery {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  /** Leads Meta itself counted (instant forms and the pixel's Lead event). */
  metaLeads: number;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  campaignId: string;
  adsetId: string;
  createdTime: string | null;
  creative: MetaCreative;
  delivery: MetaDelivery;
}

export interface MetaAdsPayload {
  since: string;
  until: string;
  campaigns: MetaCampaign[];
  adsets: MetaAdset[];
  ads: MetaAd[];
  error?: string;
}

const EMPTY_DELIVERY: MetaDelivery = { spend: 0, impressions: 0, reach: 0, clicks: 0, metaLeads: 0 };
const cache = new Map<string, { at: number; payload: MetaAdsPayload }>();
const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
const cents = (v: unknown) => {
  const n = num(v);
  return n == null ? null : n / 100;
};

async function getAll<T>(path: string, params: Record<string, string>, token: string): Promise<T[]> {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("limit", "200");
  url.searchParams.set("access_token", token);
  const out: T[] = [];
  let next: string | undefined = url.toString();
  for (let i = 0; next && i < 20; i++) {
    const res: Response = await fetch(next, { cache: "no-store" });
    const json = (await res.json()) as { data?: T[]; paging?: { next?: string }; error?: { message?: string } };
    if (!res.ok || json.error) throw new Error(json.error?.message ?? `Meta ${path} failed: ${res.status}`);
    out.push(...(json.data ?? []));
    next = json.paging?.next;
  }
  return out;
}

/* ---------------------------------------------------------------- creative */

interface RawCreative {
  title?: string;
  body?: string;
  image_url?: string;
  thumbnail_url?: string;
  video_id?: string;
  call_to_action_type?: string;
  object_story_spec?: {
    page_id?: string;
    link_data?: {
      message?: string;
      name?: string;
      description?: string;
      link?: string;
      picture?: string;
      call_to_action?: { type?: string };
      child_attachments?: { picture?: string; name?: string }[];
    };
    video_data?: {
      message?: string;
      title?: string;
      link_description?: string;
      image_url?: string;
      video_id?: string;
      call_to_action?: { type?: string; value?: { link?: string } };
    };
  };
  asset_feed_spec?: {
    bodies?: { text?: string }[];
    titles?: { text?: string }[];
    descriptions?: { text?: string }[];
    call_to_action_types?: string[];
    link_urls?: { website_url?: string }[];
    videos?: { video_id?: string; thumbnail_url?: string }[];
    images?: { url?: string }[];
  };
}

/** SIGN_UP → "Sign up", the way Meta's button reads. */
function ctaLabel(type: string | undefined | null): string | null {
  if (!type || type === "NO_BUTTON") return null;
  const s = type.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function readCreative(c: RawCreative | undefined, pages: Map<string, { name: string; picture: string | null }>): MetaCreative {
  const story = c?.object_story_spec;
  const link = story?.link_data;
  const video = story?.video_data;
  const feed = c?.asset_feed_spec;
  const page = story?.page_id ? pages.get(story.page_id) : undefined;

  const isVideo = Boolean(c?.video_id || video?.video_id || feed?.videos?.length);
  const isCarousel = Boolean(link?.child_attachments?.length);
  const format: AdFormat = isVideo ? "video" : isCarousel ? "carousel" : c?.image_url || link?.picture || feed?.images?.length || c?.thumbnail_url ? "image" : "unknown";

  return {
    format,
    body: video?.message ?? link?.message ?? feed?.bodies?.[0]?.text ?? c?.body ?? null,
    headline: video?.title ?? link?.name ?? feed?.titles?.[0]?.text ?? c?.title ?? null,
    description: video?.link_description ?? link?.description ?? feed?.descriptions?.[0]?.text ?? null,
    cta: ctaLabel(video?.call_to_action?.type ?? link?.call_to_action?.type ?? feed?.call_to_action_types?.[0] ?? c?.call_to_action_type),
    link: video?.call_to_action?.value?.link ?? link?.link ?? feed?.link_urls?.[0]?.website_url ?? null,
    // The large picture first; Meta's thumbnail_url is small and only a last resort.
    imageUrl:
      c?.image_url ?? link?.picture ?? link?.child_attachments?.[0]?.picture ?? video?.image_url ?? feed?.videos?.[0]?.thumbnail_url ?? feed?.images?.[0]?.url ?? c?.thumbnail_url ?? null,
    pageName: page?.name ?? null,
    pagePicture: page?.picture ?? null,
  };
}

/* ---------------------------------------------------------------- audience */

interface RawTargeting {
  geo_locations?: { countries?: string[]; regions?: { name?: string }[]; cities?: { name?: string }[] };
  age_min?: number;
  age_max?: number;
  genders?: number[];
  flexible_spec?: { interests?: { name?: string }[]; behaviors?: { name?: string }[]; work_positions?: { name?: string }[] }[];
  interests?: { name?: string }[];
  custom_audiences?: { name?: string }[];
  excluded_custom_audiences?: { name?: string }[];
  targeting_automation?: { advantage_audience?: number };
}

function audienceLines(t: RawTargeting | undefined): string[] {
  if (!t) return [];
  const lines: string[] = [];
  const places = [...(t.geo_locations?.countries ?? []), ...(t.geo_locations?.regions ?? []).map((r) => r.name), ...(t.geo_locations?.cities ?? []).map((c) => c.name)].filter(Boolean);
  if (places.length) lines.push(places.join(", "));
  if (t.age_min || t.age_max) lines.push(`Ages ${t.age_min ?? 18}-${t.age_max && t.age_max < 65 ? t.age_max : "65+"}`);
  if (t.genders?.length === 1) lines.push(t.genders[0] === 1 ? "Men" : "Women");
  const interests = [...(t.interests ?? []), ...(t.flexible_spec ?? []).flatMap((f) => [...(f.interests ?? []), ...(f.behaviors ?? []), ...(f.work_positions ?? [])])]
    .map((i) => i.name)
    .filter(Boolean);
  if (interests.length) lines.push(`Interests: ${interests.slice(0, 8).join(", ")}${interests.length > 8 ? "…" : ""}`);
  const custom = (t.custom_audiences ?? []).map((a) => a.name).filter(Boolean);
  if (custom.length) lines.push(`Audiences: ${custom.join(", ")}`);
  const excluded = (t.excluded_custom_audiences ?? []).map((a) => a.name).filter(Boolean);
  if (excluded.length) lines.push(`Excluding: ${excluded.join(", ")}`);
  if (t.targeting_automation?.advantage_audience === 1) lines.push("Advantage+ audience on");
  if (!interests.length && !custom.length) lines.push("Broad");
  return lines;
}

/* ---------------------------------------------------------------- loader */

interface RawInsight {
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  inline_link_clicks?: string;
  actions?: { action_type?: string; value?: string }[];
}

export async function getMetaAds(since: string, until: string, fresh = false): Promise<MetaAdsPayload> {
  const token = process.env.META_ACCESS_TOKEN;
  const rawAccount = process.env.META_AD_ACCOUNT_ID;
  const base: MetaAdsPayload = { since, until, campaigns: [], adsets: [], ads: [] };
  if (!token || !rawAccount) return { ...base, error: "Meta is not connected (META_ACCESS_TOKEN / META_AD_ACCOUNT_ID missing)" };

  const key = `${since}|${until}`;
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.payload;

  const act = `act_${rawAccount.replace(/^act_/, "")}`;
  const live = JSON.stringify([{ field: "effective_status", operator: "IN", value: ["ACTIVE", "PAUSED", "CAMPAIGN_PAUSED", "ADSET_PAUSED", "IN_PROCESS", "WITH_ISSUES", "PENDING_REVIEW", "DISAPPROVED", "PREAPPROVED", "PENDING_BILLING_INFO"] }]);

  try {
    const [campaigns, adsets, ads, insights] = await Promise.all([
      getAll<Record<string, unknown>>(`${act}/campaigns`, { fields: "id,name,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time", filtering: live }, token),
      getAll<Record<string, unknown>>(`${act}/adsets`, { fields: "id,campaign_id,name,effective_status,daily_budget,optimization_goal,targeting", filtering: live }, token),
      getAll<Record<string, unknown>>(
        `${act}/ads`,
        {
          fields:
            "id,name,effective_status,campaign_id,adset_id,created_time,creative{title,body,image_url,thumbnail_url,video_id,call_to_action_type,object_story_spec,asset_feed_spec}",
          filtering: live,
          thumbnail_width: "600",
          thumbnail_height: "600",
        },
        token,
      ),
      getAll<RawInsight>(
        `${act}/insights`,
        { level: "ad", fields: "ad_id,ad_name,adset_id,campaign_id,campaign_name,spend,impressions,reach,inline_link_clicks,actions", time_range: JSON.stringify({ since, until }) },
        token,
      ),
    ]);

    // The Facebook page each ad runs as, for the preview's name and picture.
    const pageIds = new Set<string>();
    for (const a of ads) {
      const id = (a.creative as RawCreative | undefined)?.object_story_spec?.page_id;
      if (id) pageIds.add(id);
    }
    const pages = new Map<string, { name: string; picture: string | null }>();
    await Promise.all(
      [...pageIds].map(async (id) => {
        try {
          const res = await fetch(`${GRAPH}/${id}?fields=name,picture{url}&access_token=${token}`, { cache: "no-store" });
          const j = (await res.json()) as { name?: string; picture?: { data?: { url?: string } } };
          if (j.name) pages.set(id, { name: j.name, picture: j.picture?.data?.url ?? null });
        } catch {
          /* the preview falls back to the company name */
        }
      }),
    );

    const delivery = new Map<string, MetaDelivery>();
    for (const r of insights) {
      if (!r.ad_id) continue;
      const leads = (r.actions ?? [])
        .filter((x) => x.action_type === "lead" || x.action_type === "onsite_conversion.lead_grouped" || x.action_type === "offsite_conversion.fb_pixel_lead")
        .reduce((m, x) => Math.max(m, Number(x.value ?? 0)), 0);
      delivery.set(r.ad_id, {
        spend: Number(r.spend ?? 0),
        impressions: Number(r.impressions ?? 0),
        reach: Number(r.reach ?? 0),
        clicks: Number(r.inline_link_clicks ?? 0),
        metaLeads: leads,
      });
    }

    const payload: MetaAdsPayload = {
      since,
      until,
      campaigns: campaigns.map((c) => ({
        id: String(c.id),
        name: String(c.name ?? ""),
        status: String(c.effective_status ?? ""),
        objective: (c.objective as string) ?? null,
        dailyBudget: cents(c.daily_budget),
        lifetimeBudget: cents(c.lifetime_budget),
        startTime: (c.start_time as string) ?? null,
        stopTime: (c.stop_time as string) ?? null,
      })),
      adsets: adsets.map((s) => ({
        id: String(s.id),
        campaignId: String(s.campaign_id ?? ""),
        name: String(s.name ?? ""),
        status: String(s.effective_status ?? ""),
        dailyBudget: cents(s.daily_budget),
        optimizationGoal: (s.optimization_goal as string) ?? null,
        audience: audienceLines(s.targeting as RawTargeting | undefined),
      })),
      ads: ads.map((a) => ({
        id: String(a.id),
        name: String(a.name ?? ""),
        status: String(a.effective_status ?? ""),
        campaignId: String(a.campaign_id ?? ""),
        adsetId: String(a.adset_id ?? ""),
        createdTime: (a.created_time as string) ?? null,
        creative: readCreative(a.creative as RawCreative | undefined, pages),
        delivery: delivery.get(String(a.id)) ?? EMPTY_DELIVERY,
      })),
    };
    // Ads archived since, which still spent in the range: kept, with what the insights row knows.
    const knownAds = new Set(payload.ads.map((a) => a.id));
    const knownCampaigns = new Set(payload.campaigns.map((c) => c.id));
    for (const r of insights) {
      if (!r.ad_id || knownAds.has(r.ad_id)) continue;
      knownAds.add(r.ad_id);
      payload.ads.push({
        id: r.ad_id,
        name: r.ad_name ?? r.ad_id,
        status: "ARCHIVED",
        campaignId: r.campaign_id ?? "",
        adsetId: r.adset_id ?? "",
        createdTime: null,
        creative: { format: "unknown", body: null, headline: null, description: null, cta: null, link: null, imageUrl: null, pageName: null, pagePicture: null },
        delivery: delivery.get(r.ad_id) ?? EMPTY_DELIVERY,
      });
      if (r.campaign_id && !knownCampaigns.has(r.campaign_id)) {
        knownCampaigns.add(r.campaign_id);
        payload.campaigns.push({ id: r.campaign_id, name: r.campaign_name ?? r.campaign_id, status: "ARCHIVED", objective: null, dailyBudget: null, lifetimeBudget: null, startTime: null, stopTime: null });
      }
    }
    cache.set(key, { at: Date.now(), payload });
    return payload;
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : "Failed to reach the Meta Marketing API" };
  }
}
