import type { Metadata } from "next";

import ZeroToHero from "../../components/ZeroToHero";

/**
 * Indexed. It answers "how do I start Amazon wholesale", which the site has
 * nothing else for, and it sells the trial rather than a call.
 *
 * The free course that used to live here is at /free-course.
 */
export const metadata: Metadata = {
  title: "Amazon Wholesale Course — Zero to Hero | Apex Applications",
  description:
    "Nine videos on Amazon wholesale: how the model works, how to open supplier accounts, how to research products and how to place your first order — with the software it is taught in, free for 7 days.",
  alternates: { canonical: "https://www.apexapplications.io/zero-to-hero" },
};

export default function Page() {
  return <ZeroToHero />;
}
