import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "../../../lib/leads/build";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** The basic-auth username off the Authorization header, for display only — middleware has already validated the credentials by the time a request reaches here. */
function usernameFromAuth(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    return separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  const payload = await getLeads(fresh);
  const goalTrials = Number(process.env.LEAD_DESK_GOAL_TRIALS) || 60;
  const goalMonth = process.env.LEAD_DESK_GOAL_MONTH || "2026-10";
  return NextResponse.json(
    { ...payload, loggedInAs: usernameFromAuth(req), goalTrials, goalMonth },
    { headers: { "x-leads-cache": fresh ? "bypass" : "maybe-hit" } },
  );
}
