import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ForPrepCenters from "../../components/ForPrepCenters";

export const metadata: Metadata = pageMetadata({
  title: "Free Prep Center Software for FBA Warehouses | Apex",
  description:
    "Receiving, FBA shipment creation, multi-client management, billing and client chat for prep centers. Free for prep centers, set up with you on an onboarding call.",
  path: "/for-prep-centers",
});

export default function Page() {
  return <ForPrepCenters />;
}
