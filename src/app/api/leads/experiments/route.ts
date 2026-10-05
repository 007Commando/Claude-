import { NextRequest, NextResponse } from "next/server";
import { getMetaAdSpend } from "../../../../lib/leads/metaSpend";
import manualSpend from "../../../../lib/leads/spend.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Spend for Lead Desk's Experiments tab: Meta's own numbers per ad per day
 * when the Marketing API answers, and the hand-kept monthly totals in
 * spend.json either way, so the tab can still show cost when the token is
 * missing or expired. Behind the Lead Desk sign-in like every /api/leads route.
 */

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days")) || 30, 1), 120);
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const meta = await getMetaAdSpend(ymd(since), ymd(until), fresh);
  return NextResponse.json(
    { since: ymd(since), until: ymd(until), rows: meta.rows, error: meta.error ?? null, manual: manualSpend },
    { headers: { "Cache-Control": "no-store" } },
  );
}
