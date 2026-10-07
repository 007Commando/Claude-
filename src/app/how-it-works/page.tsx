import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import HowItWorks from "../../components/HowItWorks";

export const metadata: Metadata = pageMetadata({
  title: "How Apex Works for Amazon Wholesale Sellers",
  description:
    "A six-step roadmap for an Amazon FBA wholesale business, from foundation to scale, using Apex Black, Blue and Green, with the Gold repricer in beta.",
  path: "/how-it-works",
});

export default function Page() {
  return <HowItWorks />;
}
