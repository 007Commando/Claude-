import { NextRequest, NextResponse } from "next/server";
import { extractAsin } from "../../../lib/fba/asin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * One ASIN for the free FBA calculator.
 *
 * The page is public, so this is where abuse would land: it only accepts a
 * ten-character ASIN, answers a visitor at most a few dozen lookups in five
 * minutes, and never exposes the internal key, which stays on this server and
 * goes to Apex's API as a query parameter the way the other internal callers
 * send it. Found products are cached at the edge for ten minutes, so a popular
 * ASIN costs the database one read, not one per visitor.
 *
 * The limiter is per server instance and best effort, like any in-memory
 * counter on a serverless host. It exists to stop a loop, not to be a wall.
 */

const BASE = process.env.APEX_API_URL ?? "https://app.apexapplications.io/api";
const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 30;
const hits = new Map<string, { count: number; reset: number }>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 2000) {
    for (const [key, value] of hits) if (value.reset < now) hits.delete(key);
  }
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function GET(req: NextRequest) {
  const asin = extractAsin(req.nextUrl.searchParams.get("asin") ?? "");
  if (!asin) return NextResponse.json({ status: "invalid" }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (tooMany(ip)) return NextResponse.json({ status: "busy" }, { status: 429 });

  const key = process.env.APEX_INTERNAL_API_KEY;
  if (!key) return NextResponse.json({ status: "error" }, { status: 503 });

  try {
    const response = await fetch(
      `${BASE}/internal/fba-calculator/${asin}?apiKey=${encodeURIComponent(key)}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (response.status === 404) {
      return NextResponse.json({ status: "not-found" }, { status: 404 });
    }
    if (!response.ok) return NextResponse.json({ status: "error" }, { status: 502 });

    const body = (await response.json()) as { found?: boolean; product?: unknown };
    if (!body.found || !body.product) return NextResponse.json({ status: "not-found" }, { status: 404 });

    return NextResponse.json(
      { status: "found", product: body.product },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}
