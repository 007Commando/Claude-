import { NextRequest, NextResponse } from "next/server";

function withNoIndex(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

export function middleware(req: NextRequest) {
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
