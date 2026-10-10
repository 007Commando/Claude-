import { NextRequest, NextResponse } from "next/server";
import { ownerOnly } from "../../../../lib/leadDesk/ownerOnly";
import { getMetaAds } from "../../../../lib/leads/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Meta campaigns, ad sets and ads with their creatives and the period's
 * delivery, for Lead Desk's Facebook ads tab. Behind the Lead Desk sign-in
 * like every /api/leads route.
 */

/** A date as New York sees it, which is the day the ad account reports in. */
const nyDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `since` and `until` (YYYY-MM-DD, New York days, inclusive) for today,
 * yesterday or a calendar range; otherwise the last `days` days to today.
 */
export async function GET(req: NextRequest) {
  const denied = await ownerOnly();
  if (denied) return denied;
  const q = req.nextUrl.searchParams;
  const fresh = q.get("fresh") === "1";
  let since = q.get("since") ?? "";
  let until = q.get("until") ?? "";
  if (!DAY.test(since) || !DAY.test(until) || since > until) {
    const days = Math.min(Math.max(Number(q.get("days")) || 30, 1), 365);
    until = nyDay(new Date());
    since = nyDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
  }
  const payload = await getMetaAds(since, until, fresh);
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
