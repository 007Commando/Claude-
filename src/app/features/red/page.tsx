import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ModulePage from "../../../components/v2/ModulePage";
import RelatedComparisons from "../../../components/RelatedComparisons";

export const metadata: Metadata = pageMetadata({
  title: "Apex Red: Prep & Shipment Management (Beta, By Invitation)",
  description:
    "Shipments, warehouses, prep center chat and prep billing next to your orders. In beta and opened by invitation; free for sellers connected to a prep center approved on Apex.",
  path: "/features/red",
});

export default function Page() {
  return (
    <>
      <ModulePage module="red" />
      <RelatedComparisons module="Apex Red" slugs={["boxem", "2d-workflow", "inventorylab"]} />
    </>
  );
}
