import type { Metadata } from "next";

import HowApexWorks from "../../components/HowApexWorks";

/**
 * Indexed, unlike the paid-traffic landing pages.
 *
 * This one is written for someone searching for how the software works, which
 * is the query it should win, and it says more about the product than any
 * other page on the site.
 */
export const metadata: Metadata = {
  title: "How Apex Works — The Full Product Guide | Apex Applications",
  description:
    "A guide to every part of Apex: what Black, Blue, Green, Red and Gold each do, what lives on every screen, how to connect Amazon, the repricer settings, and team permissions.",
  alternates: {
    canonical: "https://www.apexapplications.io/how-apex-works",
  },
};

export default function Page() {
  return <HowApexWorks />;
}
