import type { Metadata } from "next";

import CourseLanding from "../../components/CourseLanding";

/**
 * The paid arm of the course landing test: same page, $29 instead of free.
 *
 * noindex on purpose. It is the same curriculum and largely the same copy as
 * /free-course, so letting both into the index would split the ranking between
 * two near-duplicates and let Google decide which one people see, which is the
 * one decision this test exists to take away from chance. Ads reach it by URL;
 * search keeps the free page.
 */
export const metadata: Metadata = {
  title: "Zero to Hero: Amazon Wholesale Course | Apex University",
  description:
    "Nine videos on Amazon wholesale: how the model works, how to open supplier accounts, how to research products and how to place your first order. One payment of $29.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.apexapplications.io/free-course" },
};

export default function Page() {
  return <CourseLanding variant="paid" />;
}
