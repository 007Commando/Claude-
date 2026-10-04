import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { pageMetadata } from "../../../lib/seo";

const data = comparisonBySlug("sellerboard");

export const metadata: Metadata = pageMetadata({ title: data.title, description: data.description, path: "/compare/sellerboard" });

export default function Page() {
  return <ComparePage data={data} />;
}
