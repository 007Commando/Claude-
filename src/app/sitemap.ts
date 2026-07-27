import type { MetadataRoute } from "next";

const SITE_URL = "https://apexapplications.io";

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const ENTRIES: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/fba-starter-bundle", changeFrequency: "weekly", priority: 0.9 },
  { path: "/features/black", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/blue", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/green", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features/red", changeFrequency: "monthly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ungating-guide", changeFrequency: "monthly", priority: 0.7 },
  { path: "/rewards-benefits", changeFrequency: "monthly", priority: 0.7 },
  { path: "/prep-center-network", changeFrequency: "monthly", priority: 0.6 },
  { path: "/distributor-vault", changeFrequency: "monthly", priority: 0.6 },
  { path: "/review-booster", changeFrequency: "monthly", priority: 0.6 },
  { path: "/auth", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
