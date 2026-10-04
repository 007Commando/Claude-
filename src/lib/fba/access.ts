import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Who may look a product up, decided on the server.
 *
 * Everyone gets three free products. After that the visitor has to be signed
 * in to an Apex account with a plan that grants access (active, trialing or
 * past due, the same rule the app applies), and a plan holder is never counted.
 *
 * The allowance is kept twice. Apex's database remembers the products each
 * network has used (by a keyed hash of the IP, never the address), so clearing
 * cookies, a private window or another browser does not reset it. A signed,
 * HttpOnly cookie remembers them for the browser, so moving to another network
 * does not reset it either. Whichever has seen more wins, and looking at a
 * product already used costs nothing.
 *
 * The price of counting by network is that people behind one shared address
 * (an office, some mobile carriers) share one allowance.
 */

export const FREE_LOOKUPS = 3;
export const COOKIE = "apex_fba_free";
const MAX_AGE = 60 * 60 * 24 * 180;

const secret = () => process.env.FBA_GATE_SECRET || process.env.APEX_INTERNAL_API_KEY || "";

const sign = (body: string) => createHmac("sha256", `fba-gate:${secret()}`).update(body).digest("base64url").slice(0, 32);

/** The ASINs this browser has used its free lookups on. A forged or damaged cookie reads as used up. */
export function readFreeAsins(value: string | undefined): string[] {
  if (!value) return [];
  const [body, signature] = value.split(".");
  if (!body || !signature) return Array(FREE_LOOKUPS).fill("");
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Array(FREE_LOOKUPS).fill("");
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { a?: unknown };
    return Array.isArray(parsed.a) ? parsed.a.filter((x): x is string => typeof x === "string").slice(0, 20) : [];
  } catch {
    return Array(FREE_LOOKUPS).fill("");
  }
}

export function writeFreeAsins(asins: string[]): { value: string; maxAge: number } {
  const body = Buffer.from(JSON.stringify({ a: asins })).toString("base64url");
  return { value: `${body}.${sign(body)}`, maxAge: MAX_AGE };
}

/**
 * The visitor's network, as a keyed hash Apex can store without holding an
 * address. IPv6 is cut to its /64, because one home or phone is handed a whole
 * /64 and can rotate through it at will.
 */
export function visitorHash(ip: string | null): string | null {
  const network = normaliseIp(ip);
  return network ? createHmac("sha256", `fba-visitor:${secret()}`).update(network).digest("hex") : null;
}

function normaliseIp(raw: string | null): string | null {
  const ip = (raw ?? "").trim().toLowerCase();
  if (!ip || ip === "unknown") return null;
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return mapped[1];
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip;
  if (!ip.includes(":")) return null;
  const [head, tail = ""] = ip.split("%")[0].split("::");
  const left = head ? head.split(":") : [];
  const right = ip.includes("::") && tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  if (groups.length !== 8) return null;
  return `${groups.slice(0, 4).map((g) => parseInt(g || "0", 16).toString(16)).join(":")}::/64`;
}

/** The address Vercel saw the request come from. */
export function clientIp(headers: Headers): string | null {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
}

/* ----------------------------- plan check ----------------------------- */

const BASE = process.env.APEX_API_URL ?? "https://app.apexapplications.io/api";
const PLAN_TTL_MS = 5 * 60 * 1000;
const planCache = new Map<string, { plan: boolean; until: number }>();

type Claims = {
  exp?: number;
  accounts?: { id?: unknown; role?: unknown }[];
  lastSelectedAccount?: { id?: unknown };
};

/** The token's claims, unverified: only used to pick which account to ask about. Apex's API verifies the token. */
const readClaims = (token: string): Claims | null => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")) as Claims;
  } catch {
    return null;
  }
};

/**
 * Whether the signed-in person has a plan, asked of Apex's own entitlements
 * endpoint with their ID token. It answers for one seller account at a time,
 * so the last-selected account is asked first and then the others they own.
 *
 * Returns null when there is no usable token (treated as signed out), false
 * when the person is signed in without a plan.
 */
export async function hasPlan(token: string | null): Promise<boolean | null> {
  if (!token || token.split(".").length !== 3) return null;
  const claims = readClaims(token);
  if (!claims || (claims.exp && claims.exp * 1000 < Date.now())) return null;

  const cached = planCache.get(token);
  if (cached && cached.until > Date.now()) return cached.plan;

  const ids = [
    null,
    ...(claims.accounts ?? [])
      .filter((a) => a.role === "seller" && typeof a.id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(a.id))
      .map((a) => a.id as string),
  ];

  for (const id of [...new Set(ids)].slice(0, 4)) {
    try {
      const response = await fetch(`${BASE}/subscriptions/entitlements`, {
        headers: { Authorization: `Bearer ${token}`, ...(id ? { "x-account-id": id } : {}) },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const body = (await response.json().catch(() => ({}))) as { plan?: string | null };
      if (response.ok && body.plan) {
        remember(token, true);
        return true;
      }
    } catch {
      // Apex's API did not answer for this account; try the next one.
    }
  }

  // Signed in (as far as the token says) without a plan. A forged token lands
  // here too, which only changes the message it sees: it never gets access.
  remember(token, false);
  return false;
}

function remember(token: string, plan: boolean) {
  if (planCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of planCache) if (value.until < now) planCache.delete(key);
  }
  planCache.set(token, { plan, until: Date.now() + PLAN_TTL_MS });
}
