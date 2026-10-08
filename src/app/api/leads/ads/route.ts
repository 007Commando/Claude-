import { NextRequest, NextResponse } from "next/server";
import { getMetaAds } from "../../../../lib/leads/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Meta campaigns, ad sets and ads with their creatives and the period's
 * delivery, for Lead Desk's Facebook ads tab. Behind the Lead Desk sign-in
 * like every /api/leads route.
 */

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days")) || 30, 1), 365);
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const payload = await getMetaAds(ymd(since), ymd(until), fresh);
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
