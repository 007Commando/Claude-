import type { Metadata } from "next";
import UngatingGuide from "../../components/UngatingGuide";

export const metadata: Metadata = {
  title: "Ungating Guide — Apex Applications",
  description:
    "How category and brand ungating works on Amazon, and a real step-by-step way to get ungated in the Grocery category.",
  alternates: { canonical: "https://apexapplications.io/ungating-guide" },
};

export default function Page() {
  return <UngatingGuide />;
}
