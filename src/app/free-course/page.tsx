import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";

import CourseLanding from "../../components/CourseLanding";

/**
 * Indexed, unlike /first-order-roadmap.
 *
 * That page sells a call and competes with the supplier and comparison pages
 * for the same queries. This one gives a course away, which is the kind of
 * page worth finding in search — and it answers a query the site has nothing
 * else for.
 */
export const metadata: Metadata = pageMetadata({
  title: "Free Amazon Wholesale Course: Zero to Hero | Apex",
  description:
    "Nine free videos on Amazon wholesale: how the model works, supplier accounts, product research and your first order. Free with an Apex account, no card.",
  path: "/free-course",
});

export default function Page() {
  return <CourseLanding variant="free" />;
}
