import type { Metadata } from "next";

import WatchLanding from "../../components/WatchLanding";

/**
 * The purchase order cut of the ad landing page.
 *
 * Kept out of the index like the other funnel pages. It exists to be linked
 * to, and an ad landing page in search results competes with the pages
 * written to rank.
 */
export const metadata: Metadata = {
  title:
    "Watch Apex analyze a catalog and build a purchase order, Apex Applications",
  description:
    "A live walkthrough: a supplier catalog checked against real Amazon fees and a purchase order built from what clears, in under two minutes. Then start your 7 day free trial.",
  alternates: { canonical: "https://www.apexapplications.io/watch" },
  robots: { index: false, follow: false },
};

export default function WatchPage() {
  return (
    <WatchLanding
      eyebrow="The two minute walkthrough"
      headline="Watch how Apex analyzes catalogs and builds a purchase order in under two minutes, live."
      // Uploaded 23 September, runs 1:44, which is what earns the claim above.
      // A Short, so vertical.
      video={{ kind: "youtube", id: "EClM6RcJ628", portrait: true }}
      videoTitle="Apex Applications: building an Amazon FBA purchase order"
      campaign="watch-demo"
    />
  );
}
