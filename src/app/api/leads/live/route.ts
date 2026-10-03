import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * What Lead Desk's Live tab draws: who is on the site right now, today's
 * sessions and the day's totals, from the backend's `live` function. Behind
 * the Lead Desk sign-in like every /api/leads route (see middleware.ts),
 * because it carries visitors' emails.
 */

const LIVE_URL = process.env.APEX_LIVE_URL || "https://us-central1-apex-apps-parent.cloudfunctions.net/live";

export async function GET() {
  const key = process.env.APEX_INTERNAL_API_KEY;
  if (!key) return NextResponse.json({ error: "Live View is not configured" }, { status: 503 });
  try {
    const res = await fetch(`${LIVE_URL}/snapshot`, {
      headers: { "x-apex-internal-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ error: `Live View answered ${res.status}` }, { status: 502 });
    return NextResponse.json(await res.json(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: `Live View is unreachable: ${String(error)}` }, { status: 502 });
  }
}
