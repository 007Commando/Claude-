import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ApexBlue from "../../../components/ApexBlue";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Purchase Order & P&L Software | Apex Blue",
  description:
    "Purchase orders, supplier management, an inventory database and a P&L by day, week or month for Amazon wholesale sellers, with real landed costs and fees.",
  path: "/features/blue",
});

export default function Page() {
  return (
    <>
      <ApexBlue />
      <RelatedComparisons module="Apex Blue" slugs={["sellerboard", "third-party-profits", "inventorylab"]} />
    </>
  );
}
