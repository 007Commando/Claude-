import type { Metadata } from "next";
import ReviewBooster from "../../components/ReviewBooster";

export const metadata: Metadata = {
  title: "Review Booster, Amazon Review Request Automation",
  description:
    "Apex Black's free-for-life Review Booster automates order review requests and seller feedback for your Amazon listings.",
  alternates: { canonical: "https://www.apexapplications.io/review-booster" },
};

export default function Page() {
  return <ReviewBooster />;
}
