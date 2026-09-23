import type { Metadata } from "next";

import WatchLanding from "../../components/WatchLanding";

/**
 * The same landing page as /watch, on the full Apex walkthrough.
 *
 * Its own URL rather than a query parameter so the two can be told apart at a
 * glance in analytics, the way apex-pop-facebook and apex-pop-primewell are,
 * and so an ad set can point at one cut without carrying the other's
 * attribution.
 */
export const metadata: Metadata = {
  title: "Watch the Apex walkthrough, Apex Applications",
  description:
    "The full walkthrough of the Apex software: supplier catalogs checked against real Amazon fees, profit worked out per unit, and the numbers a wholesale buy is decided on. Then start your 7 day free trial.",
  alternates: { canonical: "https://www.apexapplications.io/walkthrough" },
  robots: { index: false, follow: false },
};

export default function WalkthroughPage() {
  return (
    <WatchLanding
      eyebrow="The full walkthrough"
      /*
       * Not the "under two minutes" line from /watch. This cut runs 4:07 and
       * opens on an introduction rather than a catalog, so that headline would
       * be promising something the first minute does not deliver, on the page
       * somebody is paying to send traffic to.
       */
      headline="Watch the full Apex walkthrough: catalogs analyzed, profit worked out, and a purchase order built."
      /*
       * 1920x1080 and 38.7 MB, so it does not autoplay: nothing is fetched
       * beyond metadata until the viewer presses play. A narrated four minute
       * walkthrough would lose its opening words to a muted start anyway.
       */
      video={{
        kind: "file",
        src: "/videos/apex-walkthrough.mp4",
        poster: "/assets/demo-poster.jpg",
        autoplay: false,
      }}
      videoTitle="The Apex Applications walkthrough"
      campaign="watch-walkthrough"
    />
  );
}
