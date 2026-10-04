import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import HowItWorks from "../../components/HowItWorks";

export const metadata: Metadata = pageMetadata({
  title: "How Apex Works for Amazon Wholesale Sellers",
  description:
    "The easiest roadmap to growing a real Amazon FBA wholesale business, from foundation to scale, powered by Apex Black, Blue and Green.",
  path: "/how-it-works",
});

export default function Page() {
  return <HowItWorks />;
}
