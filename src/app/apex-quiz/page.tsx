import type { Metadata } from "next";

import ApexQuiz from "../../components/ApexQuiz";

/**
 * The seller quiz funnel (October 2026): five one-tap questions, a result per
 * seller type, then the $1 week. An ad destination, so not indexed.
 */
export const metadata: Metadata = {
  title: "What Kind of Amazon Seller Are You? | 60-Second Quiz | Apex",
  description:
    "Five quick questions. Find out the one thing to fix first in your Amazon business, and the plan sellers like you use.",
  alternates: { canonical: "https://www.apexapplications.io/apex-quiz" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ApexQuiz />;
}
