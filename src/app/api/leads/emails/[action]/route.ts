import { NextRequest, NextResponse } from "next/server";
import { ownerOnly } from "../../../../../lib/leadDesk/ownerOnly";
import { emailDeskFetch, type EmailDeskAction } from "../../../../../lib/leads/emailDesk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// "Who's next" runs a campaign's dry run, which can take a while for the big ones.
export const maxDuration = 300;

const ACTIONS: EmailDeskAction[] = ["preview", "activity", "queue"];

/** One email's preview, recent sends and clicks, or next-run recipients. Owner only. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ action: string }> }) {
  const denied = await ownerOnly();
  if (denied) return denied;
  const { action } = await ctx.params;
  if (!ACTIONS.includes(action as EmailDeskAction)) return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  const q = req.nextUrl.searchParams;
  const params: Record<string, string> = {};
  for (const key of ["template", "id", "fresh"]) {
    const value = q.get(key);
    if (value) params[key] = value;
  }
  const { status, body } = await emailDeskFetch(`/${action}`, params);
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
