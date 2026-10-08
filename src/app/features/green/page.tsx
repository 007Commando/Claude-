import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ModulePage from "../../../components/v2/ModulePage";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Apex Green: Product Sourcing & UPC Scanner for Amazon Wholesale",
  description:
    "Upload a supplier price list, match each UPC or EAN to Amazon in the background, then filter by profit, ROI, sales rank and competition.",
  path: "/features/green",
});

export default function Page() {
  return (
    <>
      <ModulePage module="green" />
      <RelatedComparisons module="Apex Green" slugs={["smartscout", "selleramp", "scan-unlimited", "rocket-source", "tactical-arbitrage", "seller-assistant", "helium10", "junglescout"]} />
    </>
  );
}
