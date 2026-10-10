#!/usr/bin/env node
/**
 * Merge a pull from the Meta Ads connector into Lead Desk's Meta snapshot and
 * upload it (Stefano, 2026-10-10). See src/lib/leads/metaSnapshot.ts for why
 * the snapshot exists and how the site reads it.
 *
 *   node scripts/meta-snapshot/push.mjs <pull.json>
 *   node scripts/meta-snapshot/push.mjs daily=<file> ads=<file> creatives=<file> ...
 *
 * The second form takes one connector result per part. A file may be the raw
 * result Claude Code saves when a connector answer is too large to show
 * ({"ad_entities": "<json>"} or {"ad_creatives": [...]}), or a plain array.
 * Both forms can be mixed; key=file parts are added to the pull file's.
 *
 * Third form, for the scheduled routine, which cannot write files (a
 * scheduled run has nowhere to show a Write permission prompt): the data as
 * arguments, one record per flag, fields separated by "|" (by "," for days),
 * free text last so a stray "|" in a name cannot shift the other fields:
 *
 *   --day      "ADID,YYYY-MM-DD,SPEND,IMPRESSIONS,REACH,CLICKS,LEADS"
 *   --ad       "ADID|CAMPAIGN_ID|ADSET_ID|STATUS|CREATIVE_ID|NAME"
 *   --campaign "ID|STATUS|DAILY_BUDGET|OBJECTIVE|NAME"
 *   --adset    "ID|CAMPAIGN_ID|STATUS|OPTIMIZATION_GOAL|NAME"
 *   --creative "ID|FORMAT|CTA_TYPE|IMAGE_URL|LINK|TITLE|BODY"   (FORMAT: video or image)
 *   --missing-creatives   print the creative ids the --ad records use that the
 *                         snapshot has no creative for, and save nothing
 *
 * The pull file holds what the connector's ads_get_ad_entities / ads_get_creatives
 * returned, pasted as-is (amounts may be {value, unit} objects). Every key is
 * optional, and a pull only replaces what it contains:
 *
 *   campaigns  [{id, name, effective_status, objective, daily_budget, lifetime_budget, start_time, stop_time}]
 *   adsets     [{id, campaign_id, name, effective_status, daily_budget, optimization_goal, targeting}]
 *   ads        [{id, name, campaign_id, adset_id, effective_status, creative_id, created_time}]
 *   creatives  [{id, body, title, description, link_url, image_url, thumbnail_url, call_to_action_type, video_id, object_type, child_attachments}]
 *   daily      [{id (ad), date_start, amount_spent, impressions, reach, clicks, lead}]  (time_increment "1")
 *
 * Daily rows replace the stored rows for the same ad and date; rows older than
 * 120 days are dropped. Reads APEX_INTERNAL_API_KEY from .env.local next to
 * this repo, never prints it.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const KEEP_DAYS = 120;

// The repo's own .env.local, or apex-app's when this copy runs from the APEX folder (the scheduled routine's copy).
const ENV_FILES = [
  join(repo, ".env.local"),
  join(repo, "apex-app", ".env.local"),
  join(here, "..", "apex-app", ".env.local"),
  join(here, "..", ".env.local"),
];

function env(name) {
  if (process.env[name]) return process.env[name];
  for (const file of ENV_FILES) {
    try {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && m[1] === name) return m[2].replace(/^"|"$/g, "");
      }
    } catch {
      /* not there */
    }
  }
  return undefined;
}

const num = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "object" && "value" in v) return v.value == null ? null : Number(v.value);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const str = (v) => (v == null ? "" : String(v));

const CTA = (type) =>
  type ? String(type).toLowerCase().split("_").map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(" ") : null;

/** The connector serialises lists as {"0": a, "1": b}; turn those back into arrays, all the way down. */
function arrays(v) {
  if (Array.isArray(v)) return v.map(arrays);
  if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length && keys.every((k, i) => k === String(i))) return keys.map((k) => arrays(v[k]));
    return Object.fromEntries(keys.map((k) => [k, arrays(v[k])]));
  }
  return v;
}

/** The same plain-language lines the live path builds (metaAds.ts audienceLines). */
function audienceLines(raw) {
  const t = arrays(raw);
  if (!t || typeof t !== "object") return [];
  const lines = [];
  const places = [
    ...(t.geo_locations?.countries ?? []),
    ...(t.geo_locations?.regions ?? []).map((r) => r.name),
    ...(t.geo_locations?.cities ?? []).map((c) => c.name),
  ].filter(Boolean);
  if (places.length) lines.push(places.join(", "));
  if (t.age_min || t.age_max) lines.push(`Ages ${t.age_min ?? 18}-${t.age_max && t.age_max < 65 ? t.age_max : "65+"}`);
  if (t.genders?.length === 1) lines.push(t.genders[0] === 1 ? "Men" : "Women");
  const interests = [
    ...(t.interests ?? []),
    ...(t.flexible_spec ?? []).flatMap((f) => [...(f.interests ?? []), ...(f.behaviors ?? []), ...(f.work_positions ?? [])]),
  ]
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

function creativeOf(c) {
  if (!c) return null;
  const isVideo = Boolean(c.video_id) || /VIDEO/i.test(str(c.object_type));
  const isCarousel = Array.isArray(c.child_attachments) && c.child_attachments.length > 1;
  return {
    format: isCarousel ? "carousel" : isVideo ? "video" : c.image_url || c.thumbnail_url ? "image" : "unknown",
    body: c.body ?? null,
    headline: c.title ?? c.child_attachments?.[0]?.name ?? null,
    description: c.description ?? null,
    cta: CTA(c.call_to_action_type),
    link: c.link_url ?? null,
    imageUrl: c.image_url ?? c.child_attachments?.[0]?.picture ?? c.thumbnail_url ?? null,
    pageName: null,
    pagePicture: null,
  };
}

const EMPTY_CREATIVE = { format: "unknown", body: null, headline: null, description: null, cta: null, link: null, imageUrl: null, pageName: null, pagePicture: null };

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) throw new Error("usage: node scripts/meta-snapshot/push.mjs <pull.json> | <part>=<file> ...");
  const PARTS = ["campaigns", "adsets", "ads", "creatives", "daily"];
  const pull = {};
  let missingOnly = false;
  const add = (part, record) => (pull[part] = [...(pull[part] ?? []), record]);
  const fields = (value, count, sep = "|") => {
    const bits = String(value).split(sep);
    return [...bits.slice(0, count - 1), bits.slice(count - 1).join(sep)].map((b) => (b ?? "").trim());
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--missing-creatives") {
      missingOnly = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const value = args[++i];
      if (value === undefined) throw new Error(`${arg} needs a value`);
      if (arg === "--day") {
        const [id, date, spend, impressions, reach, clicks, lead] = fields(value, 7, ",");
        add("daily", { id, date_start: date, amount_spent: spend, impressions, reach, clicks, lead: lead || 0 });
      } else if (arg === "--ad") {
        const [id, campaign_id, adset_id, effective_status, creative_id, name] = fields(value, 6);
        add("ads", { id, campaign_id, adset_id, effective_status, creative_id: creative_id || null, name });
      } else if (arg === "--campaign") {
        const [id, effective_status, daily_budget, objective, name] = fields(value, 5);
        add("campaigns", { id, effective_status, daily_budget: daily_budget || null, objective: objective || null, name });
      } else if (arg === "--adset") {
        const [id, campaign_id, effective_status, optimization_goal, name] = fields(value, 5);
        add("adsets", { id, campaign_id, effective_status, optimization_goal: optimization_goal || null, name });
      } else if (arg === "--creative") {
        const [id, format, cta, image, link, title, body] = fields(value, 7);
        add("creatives", {
          id,
          object_type: format === "video" ? "VIDEO" : "IMAGE",
          video_id: format === "video" ? "video" : null,
          call_to_action_type: cta || null,
          image_url: image || null,
          link_url: link || null,
          title: title || null,
          body: body || null,
        });
      } else {
        throw new Error(`unknown flag ${arg}`);
      }
      continue;
    }
    const eq = arg.indexOf("=");
    const part = eq > 0 ? arg.slice(0, eq) : null;
    const raw = JSON.parse(readFileSync(eq > 0 ? arg.slice(eq + 1) : arg, "utf8"));
    if (!part) {
      for (const k of PARTS) if (Array.isArray(raw[k])) pull[k] = [...(pull[k] ?? []), ...raw[k]];
      continue;
    }
    if (!PARTS.includes(part)) throw new Error(`unknown part "${part}"; use ${PARTS.join(", ")}`);
    // A saved connector result: {ad_entities: "<json string>"} or {ad_creatives: [...]}.
    const list = Array.isArray(raw)
      ? raw
      : typeof raw.ad_entities === "string"
        ? JSON.parse(raw.ad_entities)
        : Array.isArray(raw.ad_entities)
          ? raw.ad_entities
          : Array.isArray(raw.ad_creatives)
            ? raw.ad_creatives
            : null;
    if (!Array.isArray(list)) throw new Error(`${arg}: not a list or a saved connector result`);
    pull[part] = [...(pull[part] ?? []), ...list];
  }
  const key = env("APEX_INTERNAL_API_KEY");
  if (!key) throw new Error("APEX_INTERNAL_API_KEY not found in the environment or .env.local");
  const base = env("APEX_API_URL") ?? "https://app.apexapplications.io/api";
  const url = `${base}/internal/marketing/meta-snapshot?apiKey=${encodeURIComponent(key)}`;

  const current = await fetch(url, { headers: { Accept: "application/json" } }).then((r) => {
    if (!r.ok) throw new Error(`reading the snapshot answered ${r.status}`);
    return r.json();
  });
  const snap = current.snapshot ?? { fetchedAt: null, campaigns: [], adsets: [], ads: [], daily: [] };

  if (missingOnly) {
    const known = new Map(snap.ads.map((a) => [a.creativeId, a.creative]));
    const missing = [...new Set((pull.ads ?? []).map((a) => str(a.creative_id)).filter(Boolean))].filter((id) => {
      const c = known.get(id);
      return !c || c.format === "unknown";
    });
    console.log(missing.length ? `MISSING_CREATIVES ${missing.join(",")}` : "MISSING_CREATIVES none");
    return;
  }

  const byId = (list) => new Map(list.map((x) => [x.id, x]));
  const campaigns = byId(snap.campaigns);
  const adsets = byId(snap.adsets);
  const ads = byId(snap.ads);

  for (const c of pull.campaigns ?? []) {
    campaigns.set(str(c.id), {
      id: str(c.id),
      name: str(c.name),
      status: str(c.effective_status ?? c.status),
      objective: c.objective ?? null,
      dailyBudget: num(c.daily_budget),
      lifetimeBudget: num(c.lifetime_budget),
      startTime: c.start_time ?? null,
      stopTime: c.stop_time ?? null,
    });
  }
  for (const s of pull.adsets ?? []) {
    const prev = adsets.get(str(s.id));
    adsets.set(str(s.id), {
      id: str(s.id),
      campaignId: str(s.campaign_id ?? prev?.campaignId),
      name: str(s.name ?? prev?.name),
      status: str(s.effective_status ?? s.status ?? prev?.status),
      dailyBudget: num(s.daily_budget) ?? prev?.dailyBudget ?? null,
      optimizationGoal: s.optimization_goal ?? prev?.optimizationGoal ?? null,
      audience: s.targeting ? audienceLines(s.targeting) : (prev?.audience ?? []),
    });
  }
  const creatives = new Map((pull.creatives ?? []).map((c) => [str(c.id), creativeOf(c)]));
  for (const a of pull.ads ?? []) {
    const prev = ads.get(str(a.id));
    ads.set(str(a.id), {
      id: str(a.id),
      name: str(a.name ?? prev?.name),
      status: str(a.effective_status ?? a.status ?? prev?.status),
      campaignId: str(a.campaign_id ?? prev?.campaignId),
      adsetId: str(a.adset_id ?? prev?.adsetId),
      createdTime: a.created_time ?? prev?.createdTime ?? null,
      creativeId: a.creative_id != null ? str(a.creative_id) : (prev?.creativeId ?? null),
      creative: creatives.get(str(a.creative_id)) ?? prev?.creative ?? EMPTY_CREATIVE,
    });
  }
  // A creative pulled on its own (an ad seen earlier) still lands on its ad.
  for (const ad of ads.values()) {
    const fresh = ad.creativeId ? creatives.get(ad.creativeId) : null;
    if (fresh) ad.creative = fresh;
  }

  // Daily rows: [adId, date, spend, impressions, reach, clicks, leads], replaced per ad and date.
  const rows = new Map(snap.daily.map((r) => [`${r[0]}|${r[1]}`, r]));
  for (const entry of pull.daily ?? []) {
    // Also accepts the stored compact form: [adId, date, spend, impressions, reach, clicks, leads].
    const d = Array.isArray(entry)
      ? { id: entry[0], date_start: entry[1], amount_spent: entry[2], impressions: entry[3], reach: entry[4], clicks: entry[5], lead: entry[6] }
      : entry;
    const id = str(d.id ?? d.ad_id);
    const date = str(d.date_start);
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    rows.set(`${id}|${date}`, [id, date, num(d.amount_spent ?? d.spend) ?? 0, num(d.impressions) ?? 0, num(d.reach) ?? 0, num(d.clicks) ?? 0, num(d.lead ?? d.leads) ?? 0]);
    // An ad that spent but was never listed (archived since): keep a stub so its numbers still show.
    if (!ads.has(id)) {
      ads.set(id, { id, name: str(d.name ?? id), status: "ARCHIVED", campaignId: str(d.campaign_id), adsetId: str(d.adset_id), createdTime: null, creativeId: null, creative: EMPTY_CREATIVE });
    }
  }
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  const daily = [...rows.values()].filter((r) => r[1] >= cutoff).sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    campaigns: [...campaigns.values()],
    adsets: [...adsets.values()],
    ads: [...ads.values()],
    daily,
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ snapshot }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`saving the snapshot answered ${res.status}: ${JSON.stringify(out)}`);
  const days = new Set(daily.map((r) => r[1]));
  console.log(
    `Meta snapshot saved: ${snapshot.campaigns.length} campaigns, ${snapshot.adsets.length} ad sets, ${snapshot.ads.length} ads, ${daily.length} daily rows over ${days.size} days (newest ${[...days].pop() ?? "none"}).`,
  );
}

main().catch((error) => {
  console.error(`Meta snapshot push failed: ${error.message}`);
  process.exit(1);
});
