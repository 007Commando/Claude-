import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "../../../../../../lib/leads/salesCallsApi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Streams one call's recording through to the browser, so an <audio src>
 * in the Lead Desk drawer can play it without the API key ever leaving the
 * server. Behind the Lead Desk sign-in like every /api/leads route.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const upstream = await getRecording(messageId, req.headers.get("range"));
  if (!upstream) return NextResponse.json({ error: "No recording" }, { status: 404 });

  const headers = new Headers({ "Cache-Control": "private, no-store" });
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("content-type")) headers.set("content-type", "audio/mpeg");
  return new Response(upstream.body, { status: upstream.status, headers });
}
