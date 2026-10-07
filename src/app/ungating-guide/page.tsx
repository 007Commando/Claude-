import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import UngatingGuide from "../../components/UngatingGuide";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Ungating Guide: Categories and Brands | Apex",
  description:
    "How category and brand ungating works on Amazon, plus a step-by-step walkthrough of applying for approval in the Grocery category.",
  path: "/ungating-guide",
});

export default function Page() {
  return <UngatingGuide />;
}
