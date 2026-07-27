import type { Metadata } from "next";
import HowItWorks from "../../components/HowItWorks";

export const metadata: Metadata = {
  title: "How Amazon Wholesale Works — Apex Applications",
  description:
    "The easiest roadmap to growing a real Amazon FBA wholesale business, from foundation to scale — powered by Apex Black, Blue, and Green.",
  alternates: { canonical: "https://apexapplications.io/how-it-works" },
};

export default function Page() {
  return <HowItWorks />;
}
