import type { MetadataRoute } from "next";

const SITE_URL = "https://apexapplications.io";

// Every crawler that respects robots.txt and either (a) sends traffic via a
// traditional search index, or (b) can cite this site in an AI-generated
// answer. Left un-blocked so both classic SEO and "answer engine" discovery
// keep working. /dashboard and /api/ stay disallowed everywhere since
// there's nothing there for a search or AI index to surface.
const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
