import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

function withNoIndex(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

/**
 * /leads and /api/leads/** are gated by Google sign-in (Auth.js) instead of
 * Basic Auth — see ./auth for the provider/allow-list config. /leads/sign-in
 * itself must stay reachable while signed out, or nobody could ever sign in.
 * /api/auth/** never reaches this function at all: it is not in `matcher`
 * below, on purpose, so the Auth.js route handler always gets the request.
 */
function isLeadDeskPath(pathname: string): boolean {
  return pathname === "/leads" || pathname.startsWith("/leads/") || pathname.startsWith("/api/leads/") || pathname === "/api/leads";
}

async function leadDeskGate(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/leads");

  if (pathname === "/leads/sign-in") {
    return withNoIndex(NextResponse.next());
  }

  const session = await auth();
  if (session?.user) {
    return withNoIndex(NextResponse.next());
  }

  if (isApi) {
    return withNoIndex(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
  }

  const signInUrl = req.nextUrl.clone();
  signInUrl.pathname = "/leads/sign-in";
  signInUrl.search = "";
  signInUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
  return withNoIndex(NextResponse.redirect(signInUrl));
}

export async function middleware(req: NextRequest) {
  /**
   * Lowercase alias for the enterprise grocery page. This lives here and not
   * in next.config redirects because those match case-insensitively: a
   * config rule from /grocerycommerce also matched /GroceryCommerce and
   * redirected the canonical URL to itself forever. String comparison in
   * code is case-sensitive, so only genuinely miscased spellings redirect.
   */
  const { pathname } = req.nextUrl;
  if (pathname.toLowerCase() === "/grocerycommerce" && pathname !== "/GroceryCommerce") {
    const url = req.nextUrl.clone();
    url.pathname = "/GroceryCommerce";
    return NextResponse.redirect(url, 308);
  }
  // The matcher compares case-insensitively, so the correctly cased page
  // reaches this function too. It is a public page: let it through rather
  // than falling into the dashboard's Basic Auth (it was answering 401 to
  // Google and every visitor).
  if (pathname === "/GroceryCommerce") return NextResponse.next();

  // Until the Google OAuth client exists (AUTH_GOOGLE_ID/SECRET), Lead Desk
  // stays behind the same Basic Auth as the dashboard, so nobody is locked
  // out while the sign-in is being set up.
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  if (isLeadDeskPath(pathname) && googleConfigured) {
    return leadDeskGate(req);
  }

  const user = process.env.DASHBOARD_USER;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!user || !password) {
    return withNoIndex(
      new NextResponse("Dashboard is not configured. Set DASHBOARD_USER and DASHBOARD_PASSWORD.", {
        status: 503,
      }),
    );
  }

  // Extra logins on top of DASHBOARD_USER/DASHBOARD_PASSWORD, e.g. so Aliza
  // has her own credentials instead of sharing Stefano's. Format:
  // "user:password,user2:password2".
  const extraCredentials = new Map<string, string>();
  for (const pair of (process.env.DASHBOARD_USERS ?? "").split(",")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) continue;
    extraCredentials.set(trimmed.slice(0, separatorIndex), trimmed.slice(separatorIndex + 1));
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const providedUser = decoded.slice(0, separatorIndex);
    const providedPassword = decoded.slice(separatorIndex + 1);
    if (providedUser === user && providedPassword === password) {
      return withNoIndex(NextResponse.next());
    }
    if (extraCredentials.has(providedUser) && extraCredentials.get(providedUser) === providedPassword) {
      return withNoIndex(NextResponse.next());
    }
  }

  return withNoIndex(
    new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Internal Dashboard"' },
    }),
  );
}

export const config = {
  // GroceryCommerce (any casing) is here only for the alias redirect above —
  // it returns before the dashboard auth gate and is never challenged.
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/leads/:path*", "/api/leads/:path*", "/grocerycommerce"],
};
