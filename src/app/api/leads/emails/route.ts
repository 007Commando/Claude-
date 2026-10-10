import { NextRequest, NextResponse } from "next/server";
import { ownerOnly } from "../../../../lib/leadDesk/ownerOnly";
import { emailDeskFetch } from "../../../../lib/leads/emailDesk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** Every automatic email with its switch and 30/14-day stats, for Lead Desk's Emails tab. Owner only. */
export async function GET(req: NextRequest) {
  const denied = await ownerOnly();
  if (denied) return denied;
  const fresh: Record<string, string> = req.nextUrl.searchParams.get("fresh") === "1" ? { fresh: "1" } : {};
  const { status, body } = await emailDeskFetch("", fresh);
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
