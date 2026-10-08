import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ModulePage from "../../../components/v2/ModulePage";

export const metadata: Metadata = pageMetadata({
  title: "Apex Black: Seller Dashboard, Review Requests & Apex University",
  description:
    "The Apex home dashboard for sales, profit and inventory value, Review Booster for Amazon's own Request a Review on eligible Amazon.com orders, and Apex University lessons.",
  path: "/features/black",
});

export default function Page() {
  return <ModulePage module="black" />;
}
