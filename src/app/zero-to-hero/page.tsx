import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";

import ZeroToHero from "../../components/ZeroToHero";

/**
 * Indexed. It answers "how do I start Amazon wholesale", which the site has
 * nothing else for, and it sells the trial rather than a call.
 *
 * The free course that used to live here is at /free-course.
 */
export const metadata: Metadata = pageMetadata({
  title: "Amazon Wholesale Course: Zero to Hero | Apex",
  description:
    "Nine videos on Amazon wholesale: how the model works, opening supplier accounts, researching products and placing your first order. Free for 7 days.",
  path: "/zero-to-hero",
});

export default function Page() {
  return <ZeroToHero />;
}
