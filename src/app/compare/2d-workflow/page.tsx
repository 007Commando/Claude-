import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { pageMetadata } from "../../../lib/seo";

const data = comparisonBySlug("2d-workflow");

export const metadata: Metadata = pageMetadata({ title: data.title, description: data.description, path: "/compare/2d-workflow" });

export default function Page() {
  return <ComparePage data={data} />;
}
