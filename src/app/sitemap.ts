import type { MetadataRoute } from "next";
import { getSortedPosts } from "../lib/blog";
import { NOINDEX_ROUTES, SITE_URL } from "../config/site";
import { COMPARISONS } from "../data/comparisons";

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const ENTRIES: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/fba-starter-bundle", changeFrequency: "weekly", priority: 0.9 },
  { path: "/apex-elite", changeFrequency: "weekly", priority: 0.9 },
  { path: "/premium-membership", changeFrequency: "weekly", priority: 0.9 },
  { path: "/GroceryCommerce", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/black", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/blue", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/green", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/red", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/gold", changeFrequency: "monthly", priority: 0.8 },
  { path: "/compare", changeFrequency: "monthly", priority: 0.8 },
  { path: "/compare/smartscout", changeFrequency: "monthly", priority: 0.8 },
  { path: "/compare/sellersnap", changeFrequency: "monthly", priority: 0.8 },
  { path: "/compare/helium10", changeFrequency: "monthly", priority: 0.8 },
  { path: "/compare/junglescout", changeFrequency: "monthly", priority: 0.8 },
  /**
   * The rest of the comparisons come from the data file rather than being
   * listed again here. A page and its sitemap entry added by different hands
   * at different times is how a sitemap starts lying; deriving them means a
   * new comparison cannot be published without being listed, or listed
   * without existing.
   */
  ...COMPARISONS.map((comparison) => ({
    path: `/compare/${comparison.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  { path: "/amazon-inventory-management-software", changeFrequency: "monthly", priority: 0.7 },
  { path: "/amazon-review-automation", changeFrequency: "monthly", priority: 0.7 },
  { path: "/amazon-wholesale-suppliers", changeFrequency: "monthly", priority: 0.6 },
  { path: "/amazon-fba-prep-centers", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/amazon-profit-calculator", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/how-apex-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ungating-guide", changeFrequency: "monthly", priority: 0.7 },
  { path: "/rewards-benefits", changeFrequency: "monthly", priority: 0.7 },
  { path: "/prep-center-network", changeFrequency: "monthly", priority: 0.6 },
  { path: "/distributor-vault", changeFrequency: "monthly", priority: 0.6 },
  { path: "/review-booster", changeFrequency: "monthly", priority: 0.6 },
  // Both indexed: one sells the trial, the other gives the course away.
  { path: "/zero-to-hero", changeFrequency: "monthly", priority: 0.7 },
  { path: "/free-course", changeFrequency: "monthly", priority: 0.6 },
  /**
   * `/auth` sat here at priority 0.5, inviting Google to index a sign-in form
   * and rank it for the brand. It is a conversion surface, not a page anyone
   * should arrive on from search — and the same crawl that found it also
   * reported it as missing an H1, which is a fair complaint about a commercial
   * page and a meaningless one about a login box.
   */
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  /**
   * Enforced rather than trusted: the noindex list and the sitemap are edited
   * months apart by different people, and a sitemap that advertises a page
   * whose own metadata says noindex asks Google to resolve a contradiction we
   * created. Filtering here means the two can never disagree again.
   */
  const indexable = ENTRIES.filter(
    (entry) => !NOINDEX_ROUTES.some((route) => entry.path === route),
  );

  const staticEntries: MetadataRoute.Sitemap = indexable.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
  const postEntries: MetadataRoute.Sitemap = getSortedPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...staticEntries, ...postEntries];
}
