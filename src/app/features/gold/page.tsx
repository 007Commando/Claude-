import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ApexGold from "../../../components/ApexGold";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Repricer With Break-Even Floors | Apex Gold",
  description:
    "Amazon repricing anchored to true break-evens from your real FBA fees. Set floors by ROI, margin or dollar profit, preview every move and keep a full log.",
  path: "/features/gold",
});

export default function Page() {
  return (
    <>
      <ApexGold />
      <RelatedComparisons module="Apex Gold" slugs={["sellersnap", "aura", "bqool", "informed-repricer", "repricer"]} />
    </>
  );
}
