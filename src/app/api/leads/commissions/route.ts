import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { isOwnerEmail } from "../../../../lib/leadDesk/allowedEmails";
import { getCommissions } from "../../../../lib/leads/stripeCommissions";
import { REP_SLUG_RE, repSlug } from "../../../../lib/leads/repLinks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Yearly deals sold through a rep link, with the 25% commission on each.
 * Behind the Lead Desk sign-in like every /api/leads route (see
 * middleware.ts). Cached for five minutes; `?fresh=1` skips the cache. A
 * Stripe failure comes back as `{ rows: [], error }` with status 200, so the
 * Calls view shows the reason instead of breaking.
 *
 * The owner sees every rep's deals; anyone else sees only their own, matched
 * by the rep id their checkout links carry (their first name, the same
 * repSlug() the drawer builds the links with). Stefano, 2026-10-09: "let Mark
 * see his own commissions".
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  const all = await getCommissions(fresh);
  const owner = isOwnerEmail(session?.user?.email);
  // ?as=<rep id> lets the owner see what one rep sees ("View as").
  const asRep = req.nextUrl.searchParams.get("as") ?? "";
  if (owner && !REP_SLUG_RE.test(asRep)) {
    return NextResponse.json({ ...all, scope: "all" }, { headers: { "Cache-Control": "no-store" } });
  }
  const mine = owner ? asRep : repSlug(session?.user?.name);
  return NextResponse.json(
    { rows: mine ? all.rows.filter((r) => r.rep === mine) : [], error: all.error, scope: "mine" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
