import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { pageMetadata } from "../../../lib/seo";

const data = comparisonBySlug("bqool");

export const metadata: Metadata = pageMetadata({ title: data.title, description: data.description, path: "/compare/bqool" });

export default function Page() {
  return <ComparePage data={data} />;
}
