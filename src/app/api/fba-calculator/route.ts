import { NextRequest, NextResponse } from "next/server";
import { clientIp, COOKIE, FREE_LOOKUPS, hasPlan, readFreeAsins, visitorHash, writeFreeAsins } from "../../../lib/fba/access";
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
 * send it.
 *
 * It also enforces the free allowance (see lib/fba/access.ts): three products
 * without an account, then a plan. The cookie is checked here; the per-network
 * count is kept by Apex's API, which refuses a lookup the network has no
 * allowance left for. That is why nothing here is cached at the
 * edge any more: a cached answer would be served without the gate running.
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

const PRIVATE = { "Cache-Control": "private, no-store" };

const ASIN = /^[A-Z0-9]{10}$/;

/** The free products used, written back to the browser so it remembers what the network has spent too. */
function remember(response: NextResponse, asins: string[]) {
  const cookie = writeFreeAsins(asins.slice(0, 20));
  response.cookies.set(COOKIE, cookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/fba-calculator",
    maxAge: cookie.maxAge,
  });
  return response;
}

export async function GET(req: NextRequest) {
  const asin = extractAsin(req.nextUrl.searchParams.get("asin") ?? "");
  if (!asin) return NextResponse.json({ status: "invalid" }, { status: 400, headers: PRIVATE });

  const ip = clientIp(req.headers) ?? "unknown";
  if (tooMany(ip)) return NextResponse.json({ status: "busy" }, { status: 429, headers: PRIVATE });

  const key = process.env.APEX_INTERNAL_API_KEY;
  if (!key) return NextResponse.json({ status: "error" }, { status: 503, headers: PRIVATE });

  // A plan holder is never counted; everyone else spends the free allowance.
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || null;
  const plan = await hasPlan(token);
  const used = readFreeAsins(req.cookies.get(COOKIE)?.value);
  const already = used.includes(asin);

  const blocked = () =>
    NextResponse.json(
      { status: plan === false ? "plan-required" : "signin-required", limit: FREE_LOOKUPS },
      { status: plan === false ? 402 : 401, headers: PRIVATE },
    );
  if (!plan && !already && used.length >= FREE_LOOKUPS) return blocked();

  const access = (spent: string[]) =>
    plan ? { plan: true, remaining: null } : { plan: false, remaining: Math.max(0, FREE_LOOKUPS - spent.length) };

  const query = new URLSearchParams({ apiKey: key });
  const visitor = plan ? null : visitorHash(ip);
  if (visitor) {
    query.set("visitor", visitor);
    query.set("limit", String(FREE_LOOKUPS));
    const known = used.filter((a) => ASIN.test(a));
    if (known.length) query.set("known", known.join(","));
  }

  try {
    const response = await fetch(`${BASE}/internal/fba-calculator/${asin}?${query.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const body = (await response.json().catch(() => null)) as {
      found?: boolean;
      product?: unknown;
      limited?: boolean;
      allowance?: { used?: string[] };
    } | null;

    // What the network and this browser have used between them. Without a
    // network count (a plan holder, or an older API) the cookie alone decides.
    const network = Array.isArray(body?.allowance?.used) ? body.allowance.used.filter((a) => ASIN.test(a)) : null;
    const merged = network ? [...new Set([...used.filter((a) => ASIN.test(a)), ...network])] : null;

    if (response.status === 403 && body?.limited) return remember(blocked(), merged ?? used);
    if (!body || (!response.ok && response.status !== 404)) {
      return NextResponse.json({ status: "error" }, { status: 502, headers: PRIVATE });
    }

    // A product that is not found does not use up a free lookup.
    if (!body.found || !body.product) {
      return NextResponse.json({ status: "not-found", access: access(merged ?? used) }, { status: 404, headers: PRIVATE });
    }

    const spent = merged ?? (plan || already ? used : [...used, asin]);
    const result = NextResponse.json({ status: "found", product: body.product, access: access(spent) }, { headers: PRIVATE });
    return plan || spent.join() === used.join() ? result : remember(result, spent);
  } catch {
    return NextResponse.json({ status: "error" }, { status: 502, headers: PRIVATE });
  }
}
