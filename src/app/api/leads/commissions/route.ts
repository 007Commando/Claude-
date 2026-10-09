import { NextRequest, NextResponse } from "next/server";
import { getCommissions } from "../../../../lib/leads/stripeCommissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Yearly deals sold through a rep link, with the 25% commission on each.
 * Behind the Lead Desk sign-in like every /api/leads route (see
 * middleware.ts). Cached for five minutes; `?fresh=1` skips the cache. A
 * Stripe failure comes back as `{ rows: [], error }` with status 200, so the
 * Calls view shows the reason instead of breaking.
 */
export async function GET(req: NextRequest) {
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  return NextResponse.json(await getCommissions(fresh), { headers: { "Cache-Control": "no-store" } });
}
