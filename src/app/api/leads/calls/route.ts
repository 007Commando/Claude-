import { NextRequest, NextResponse } from "next/server";
import { getContactCalls, getSalesCalls } from "../../../../lib/leads/salesCallsApi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The sales calls Lead Desk shows. `?days=N` (default 30, at most 120) lists
 * every call in that window without transcripts; `?contactId=…` returns one
 * contact's calls with transcripts. Behind the Lead Desk sign-in like every
 * /api/leads route (see middleware.ts): calls carry names and recordings.
 * Until the backend job is deployed the calls endpoints answer 404, which
 * comes back here as an empty list, never an error.
 */
export async function GET(req: NextRequest) {
  const contactId = req.nextUrl.searchParams.get("contactId");
  if (contactId) {
    return NextResponse.json({ calls: await getContactCalls(contactId) }, { headers: { "Cache-Control": "no-store" } });
  }
  const days = Math.min(Math.max(Math.round(Number(req.nextUrl.searchParams.get("days"))) || 30, 1), 120);
  return NextResponse.json({ calls: await getSalesCalls(days) }, { headers: { "Cache-Control": "no-store" } });
}
