import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import UngatingGuide from "../../components/UngatingGuide";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Ungating Guide: Categories and Brands | Apex",
  description:
    "How category and brand ungating works on Amazon, plus a real step-by-step way to get ungated in the Grocery category, from the Apex Applications team.",
  path: "/ungating-guide",
});

export default function Page() {
  return <UngatingGuide />;
}
