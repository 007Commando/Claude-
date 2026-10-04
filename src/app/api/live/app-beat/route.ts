import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Relays an in-app Live View heartbeat from app.apexapplications.io to the
 * backend's `live` function, adding the user's city from Vercel's IP
 * geolocation (the app's own hosting has none).
 *
 * The app posts it as text/plain with `mode: "no-cors"` (and sendBeacon on
 * close), so the browser sends it without a CORS preflight and nothing here
 * needs to answer one. The beat carries the user's Firebase ID token; the
 * backend verifies it, so a forged beat records nothing. Always 204.
 */

const LIVE_URL = process.env.APEX_LIVE_URL || "https://us-central1-apex-apps-parent.cloudfunctions.net/live";
const APP_ORIGIN = /^https:\/\/app\.apexapplications\.io$/;

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
  const origin = req.headers.get("origin") ?? "";
  if (!key || (origin && !APP_ORIGIN.test(origin))) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!body || typeof body !== "object" || typeof body.idToken !== "string") {
    return new NextResponse(null, { status: 204 });
  }

  const ua = req.headers.get("user-agent") ?? "";
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
    await fetch(`${LIVE_URL}/app-beat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apex-internal-key": key },
      body: JSON.stringify(beat),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // One beat lost; the next one thirty seconds later catches up.
  }
  return new NextResponse(null, { status: 204 });
}
