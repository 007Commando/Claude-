import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ReviewBooster from "../../components/ReviewBooster";

export const metadata: Metadata = pageMetadata({
  title: "Review Booster: Free Amazon Review Request Tool",
  description:
    "Review Booster is Apex Black's free-for-life tool that automates order review requests and seller feedback for your Amazon listings.",
  path: "/review-booster",
});

export default function Page() {
  return <ReviewBooster />;
}
