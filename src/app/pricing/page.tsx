import type { Metadata } from "next";
import PickPlan from "../../components/PickPlan";

export const metadata: Metadata = {
  title: "Pricing — Apex Applications | Amazon Wholesale Software",
  description:
    "Starter and Pro plans for the Apex Applications Amazon wholesale suite, both with a 7-day free trial before billing starts.",
  alternates: { canonical: "https://apexapplications.io/pricing" },
};

export default function Page() {
  return <PickPlan />;
}
