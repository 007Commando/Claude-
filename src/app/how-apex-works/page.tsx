import type { Metadata } from "next";

import HowApexWorks from "../../components/HowApexWorks";

/**
 * Unlisted: reachable by anyone with the link, absent from search.
 *
 * The guide names all 25 application routes and lays out the module structure,
 * which is more of the product's shape than needs to be sitting in a public
 * index. It is meant to be handed out — in a support reply, in onboarding, from
 * inside the app — not found cold.
 *
 * Deliberately noindex rather than a robots.txt Disallow. Disallow stops the
 * crawl, and a crawler that never fetches the page never sees a noindex, so the
 * URL can still surface as a bare link with no description. Letting crawlers in
 * and telling them not to index is what actually keeps it out. It is also left
 * out of the sitemap, since a sitemap is a request to index.
 */
export const metadata: Metadata = {
  title: "How Apex Works — The Full Product Guide | Apex Applications",
  description:
    "A guide to every part of Apex: what Black, Blue, Green, Red and Gold each do, what lives on every screen, how to connect Amazon, the repricer settings, and team permissions.",
  alternates: {
    canonical: "https://www.apexapplications.io/how-apex-works",
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HowApexWorks />;
}
