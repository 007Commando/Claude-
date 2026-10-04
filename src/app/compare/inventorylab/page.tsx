import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { pageMetadata } from "../../../lib/seo";

const data = comparisonBySlug("inventorylab");

export const metadata: Metadata = pageMetadata({ title: data.title, description: data.description, path: "/compare/inventorylab" });

export default function Page() {
  return <ComparePage data={data} />;
}
