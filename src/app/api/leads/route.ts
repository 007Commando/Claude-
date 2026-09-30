import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "../../../lib/leads/build";
import { auth } from "../../../auth";
import { getAllowedEmails, isOwnerEmail } from "../../../lib/leadDesk/allowedEmails";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Username from a Basic Authorization header, for the pre-Google fallback gate. */
function basicAuthUser(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
    const i = decoded.indexOf(":");
    return i > 0 ? decoded.slice(0, i) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  const payload = await getLeads(fresh);
  const goalTrials = Number(process.env.LEAD_DESK_GOAL_TRIALS) || 60;
  const goalMonth = process.env.LEAD_DESK_GOAL_MONTH || "2026-10";

  const session = await auth();
  const email = session?.user?.email ?? null;
  const loggedInAs = session?.user?.name || email || basicAuthUser(req) || null;

  return NextResponse.json(
    {
      ...payload,
      loggedInAs,
      goalTrials,
      goalMonth,
      allowedEmails: getAllowedEmails(),
      isOwner: isOwnerEmail(email),
    },
    { headers: { "x-leads-cache": fresh ? "bypass" : "maybe-hit" } },
  );
}
