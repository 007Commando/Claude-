/**
 * What each Facebook campaign is for, so Lead Desk can compare promotions and
 * funnel stages against each other (Stefano, 2026-10-08: "is this for Review
 * Booster, is this top of funnel, middle of funnel").
 *
 * Read from the campaign's name, so a media buyer sets it where they already
 * work: put the promotion's words and TOFU, MOFU or BOFU in the name, e.g.
 * "Review Booster | TOFU | Free until Oct 31". OVERRIDES pins a campaign by its
 * Meta id when its name can't change.
 */

export type FunnelStage = "top" | "middle" | "bottom";

export const STAGE_LABELS: Record<FunnelStage, string> = {
  top: "Top of funnel",
  middle: "Middle of funnel",
  bottom: "Bottom of funnel",
};

/** First match wins, so the specific promotions sit above the general ones. */
const PROMOTIONS: { label: string; test: RegExp; stage: FunnelStage }[] = [
  { label: "Retargeting", test: /retarget|remarket|warm|site visitors/, stage: "bottom" },
  { label: "Review Booster", test: /review booster|\brb\b/, stage: "top" },
  { label: "Seller quiz", test: /quiz/, stage: "top" },
  { label: "Apex Scan", test: /\bscan\b|vsl/, stage: "top" },
  { label: "Free VA", test: /free va|\bva\b/, stage: "top" },
  { label: "$1 week", test: /\$1|dollar week|sales campaign/, stage: "bottom" },
  { label: "PrimeWell", test: /primewell/, stage: "top" },
  { label: "Apex Pop (free account)", test: /apex pop|\bpop\b/, stage: "top" },
  { label: "FBA starter", test: /fba starter|starter bundle/, stage: "top" },
];

const OVERRIDES: Record<string, { promotion?: string; stage?: FunnelStage }> = {};

export function promotionOf(campaignId: string | null, campaignName: string | null): string {
  const pinned = campaignId ? OVERRIDES[campaignId]?.promotion : undefined;
  if (pinned) return pinned;
  const n = (campaignName ?? "").toLowerCase();
  return PROMOTIONS.find((p) => p.test.test(n))?.label ?? "Other";
}

export function stageOf(campaignId: string | null, campaignName: string | null): FunnelStage {
  const pinned = campaignId ? OVERRIDES[campaignId]?.stage : undefined;
  if (pinned) return pinned;
  const n = (campaignName ?? "").toLowerCase();
  if (/\btofu\b|top of funnel|\bcold\b/.test(n)) return "top";
  if (/\bmofu\b|middle of funnel/.test(n)) return "middle";
  if (/\bbofu\b|bottom of funnel/.test(n)) return "bottom";
  return PROMOTIONS.find((p) => p.test.test(n))?.stage ?? "top";
}
