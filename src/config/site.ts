/**
 * The canonical host, in one place.
 *
 * The bare domain was declared in thirty-odd files — every page's canonical
 * tag, the sitemap, robots.txt, the Open Graph URLs and the schema blocks. The
 * site does not serve there: it 308-redirects to `www`, and always has.
 *
 * So every sitemap entry pointed at a redirect, every canonical tag named a URL
 * that is not the one Google receives, and robots.txt declared a preferred host
 * that answers 308. That is the "44 incorrect sitemap entries" finding, and it
 * is one typo repeated rather than forty-four separate mistakes.
 *
 * `www` is chosen because it is what already serves 200 — aligning the code to
 * the live routing changes no redirects and risks nothing. Moving the site to
 * the bare domain instead would be a hosting change, and should be a deliberate
 * decision rather than a side effect of fixing the metadata.
 */
export const SITE_URL = "https://www.apexapplications.io";

/** Absolute URL for a site-relative path. Keeps the host out of page files. */
export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Routes that must never appear in the sitemap or a search index.
 *
 * These are conversion and account surfaces. `/auth` was in the sitemap at
 * priority 0.5, which invites Google to index a login form and rank it for the
 * brand — and the crawler that found it also reported the page as missing an
 * H1, which is a fair observation about a commercial page and a meaningless
 * one about a sign-in box.
 *
 * Crawling stays allowed: a page blocked in robots.txt can never be read, so
 * its noindex is never seen and the URL can still surface as a bare link.
 */
export const NOINDEX_ROUTES = [
  "/auth",
  "/auth/signout",
  "/checkout",
  "/dashboard",
  "/start",
  "/proposal",
  "/fba-starter-bundle/thank-you",
] as const;
