import type { Metadata } from "next";

import FreeCourse from "../../components/FreeCourse";

/**
 * Indexed, unlike /first-order-roadmap.
 *
 * That page sells a call and competes with the supplier and comparison pages
 * for the same queries. This one gives a course away, which is the kind of
 * page worth finding in search — and it answers a query the site has nothing
 * else for.
 */
export const metadata: Metadata = {
  title: "Free Amazon Wholesale Course — Zero to Hero | Apex University",
  description:
    "Nine free videos on Amazon wholesale: how the model works, how to open supplier accounts, how to research products and how to place your first order. Free with an Apex account — no card.",
  alternates: { canonical: "https://www.apexapplications.io/free-course" },
};

export default function Page() {
  return <FreeCourse />;
}
