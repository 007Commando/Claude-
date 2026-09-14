import type { Metadata } from "next";
import ComparePage from "../../../components/ComparePage";
import { comparisonBySlug } from "../../../data/comparisons";
import { absoluteUrl } from "../../../config/site";

const data = comparisonBySlug("informed-repricer");

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: absoluteUrl("/compare/informed-repricer") },
};

export default function Page() {
  return <ComparePage data={data} />;
}
