import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Relays a Live View heartbeat from the browser to the backend's `live`
 * function, adding where the visitor is from Vercel's IP geolocation.
 *
 * Public, like any analytics beacon: it carries nothing secret, and the
 * backend checks every field again. The internal key stays on this server.
 * Always answers 204, because a visitor's page has no use for an error.
 */

const LIVE_URL = process.env.APEX_LIVE_URL || "https://us-central1-apex-apps-parent.cloudfunctions.net/live";
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor/i;

function header(req: NextRequest, name: string) {
  const value = req.headers.get(name);
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function coordinate(value: string | undefined) {
  const n = value === undefined ? NaN : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function POST(req: NextRequest) {
  const key = process.env.APEX_INTERNAL_API_KEY;
  const ua = req.headers.get("user-agent") ?? "";
  if (!key || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    // sendBeacon posts a Blob, so read text rather than trusting the content type.
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!body || typeof body !== "object") return new NextResponse(null, { status: 204 });

  const beat = {
    ...body,
    city: header(req, "x-vercel-ip-city"),
    region: header(req, "x-vercel-ip-country-region"),
    country: header(req, "x-vercel-ip-country"),
    lat: coordinate(header(req, "x-vercel-ip-latitude")),
    lon: coordinate(header(req, "x-vercel-ip-longitude")),
    device: /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop",
  };

  try {
    await fetch(`${LIVE_URL}/beat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apex-internal-key": key },
      body: JSON.stringify(beat),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // The map misses one beat; the next one fifteen seconds later catches up.
  }
  return new NextResponse(null, { status: 204 });
}
