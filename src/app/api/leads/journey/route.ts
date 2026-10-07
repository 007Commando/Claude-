import { NextRequest, NextResponse } from "next/server";
import { getJourney } from "../../../../lib/leads/journey";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** One lead's full GHL history for the drawer. Gated with the rest of /api/leads by the middleware. */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const events = await getJourney(email);
  return NextResponse.json({ events });
}
