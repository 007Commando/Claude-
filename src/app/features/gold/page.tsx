import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ModulePage from "../../../components/v2/ModulePage";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Apex Gold: Amazon Repricer (Beta, Pro Plan)",
  description:
    "A rule-based Amazon repricer in beta. Floors come from your cost and Amazon's fees, you preview each change, and every decision is logged. Pro on every listing; Plus 5; Beginner 1.",
  path: "/features/gold",
});

export default function Page() {
  return (
    <>
      <ModulePage module="gold" />
      <RelatedComparisons module="Apex Gold" slugs={["sellersnap", "aura", "bqool", "informed-repricer", "repricer"]} />
    </>
  );
}
