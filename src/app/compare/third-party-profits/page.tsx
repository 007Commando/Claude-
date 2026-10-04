import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { pageMetadata } from "../../../lib/seo";

const data = comparisonBySlug("third-party-profits");

export const metadata: Metadata = pageMetadata({ title: data.title, description: data.description, path: "/compare/third-party-profits" });

export default function Page() {
  return <ComparePage data={data} />;
}
