import type { Metadata } from "next";

import FirstOrderRoadmap from "../../components/FirstOrderRoadmap";

/**
 * Kept out of the index deliberately, as the source page was.
 *
 * This is a paid-traffic landing page for one offer. Indexed, it would compete
 * with /amazon-wholesale-suppliers and the comparison pages for the same
 * queries while saying less about the product, and its copy is written for
 * someone who has just clicked an ad rather than someone searching.
 */
export const metadata: Metadata = {
  title: "Before Your First Amazon Order, Get a Plan | Apex Applications",
  description:
    "Find suppliers, understand selling approvals and check the numbers before your first Amazon wholesale order. Book a free strategy call with the Apex team.",
  alternates: {
    canonical: "https://www.apexapplications.io/first-order-roadmap",
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FirstOrderRoadmap />;
}
