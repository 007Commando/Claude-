import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { pageMetadata } from "../../../lib/seo";

const data = comparisonBySlug("scan-unlimited");

export const metadata: Metadata = pageMetadata({ title: data.title, description: data.description, path: "/compare/scan-unlimited" });

export default function Page() {
  return <ComparePage data={data} />;
}
