import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ReviewBooster from "../../components/ReviewBooster";

export const metadata: Metadata = pageMetadata({
  title: "Review Booster: Automatic Amazon Review Requests",
  description:
    // "free-for-life" removed 2026-10-07: it is free to switch on only until Oct 31, 2026.
    "Review Booster sends Amazon's own review request on eligible Amazon.com orders, after a wait you choose. Free to switch on until October 31, 2026.",
  path: "/review-booster",
});

export default function Page() {
  return <ReviewBooster />;
}
