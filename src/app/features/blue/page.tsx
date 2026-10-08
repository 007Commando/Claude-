import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ModulePage from "../../../components/v2/ModulePage";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Apex Blue: Purchase Orders & Profit Analytics for Amazon Sellers",
  description:
    "Suppliers, purchase orders with landed cost, a profit and loss statement by day, week or month, operating expenses and restock planning, from your own costs and Amazon fees.",
  path: "/features/blue",
});

export default function Page() {
  return (
    <>
      <ModulePage module="blue" />
      <RelatedComparisons module="Apex Blue" slugs={["sellerboard", "third-party-profits", "inventorylab"]} />
    </>
  );
}
