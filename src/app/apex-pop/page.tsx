import type { Metadata } from "next";

import ApexPop from "../../components/ApexPop";

/**
 * Kept out of the index, like /first-order-roadmap.
 *
 * This is a paid-traffic landing page for one action. Indexed, it would
 * compete with /amazon-wholesale-suppliers and the feature pages for the same
 * queries while saying less about the product, and the copy is written for
 * someone who has just clicked an ad rather than someone searching.
 */
export const metadata: Metadata = {
  title: "Apex POP — Build Your First or Next Amazon Wholesale Purchase Order",
  description:
    "Apex POP is a working process with the Apex team: suppliers, catalog analysis, capital, then a purchase order built in the Apex Purchase Order Builder. Not a course.",
  alternates: {
    canonical: "https://www.apexapplications.io/apex-pop",
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ApexPop />;
}
