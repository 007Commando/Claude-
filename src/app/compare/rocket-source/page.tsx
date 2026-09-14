import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { absoluteUrl } from "../../../config/site";

const data = comparisonBySlug("rocket-source");

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: absoluteUrl("/compare/rocket-source") },
};

export default function Page() {
  return <ComparePage data={data} />;
}
