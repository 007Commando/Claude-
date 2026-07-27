import type { Metadata } from "next";
import ReviewBooster from "../../components/ReviewBooster";

export const metadata: Metadata = {
  title: "Review Booster — Free Amazon Review Automation | Apex Applications",
  description:
    "Apex Black's free-for-life Review Booster automates order review requests and seller feedback for your Amazon listings.",
  alternates: { canonical: "https://apexapplications.io/review-booster" },
};

export default function Page() {
  return <ReviewBooster />;
}
