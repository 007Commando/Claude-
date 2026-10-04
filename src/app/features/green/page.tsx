import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ApexGreen from "../../../components/ApexGreen";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "UPC Scanner for Amazon Wholesale | Apex Green",
  description:
    "Upload a supplier price list and Apex Green matches every UPC to its ASIN, then shows profit, ROI and sales rank per row. Up to 100,000 UPCs an hour.",
  path: "/features/green",
});

export default function Page() {
  return (
    <>
      <ApexGreen />
      <RelatedComparisons module="Apex Green" slugs={["smartscout", "selleramp", "scan-unlimited", "rocket-source", "tactical-arbitrage", "seller-assistant", "helium10", "junglescout"]} />
    </>
  );
}
