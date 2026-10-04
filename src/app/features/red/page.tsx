import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ApexRed from "../../../components/ApexRed";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Amazon FBA Prep Center & Shipment Software | Apex Red",
  description:
    "Manage FBA shipments, warehouses, inventory and prep center billing in one place, alongside Apex's prep center network. Now in beta.",
  path: "/features/red",
});

export default function Page() {
  return (
    <>
      <ApexRed />
      <RelatedComparisons module="Apex Red" slugs={["boxem", "2d-workflow", "inventorylab"]} />
    </>
  );
}
