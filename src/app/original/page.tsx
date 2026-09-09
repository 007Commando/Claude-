import type { Metadata } from "next";

import OriginalLandingPage from "../../components/OriginalLandingPage";

export const metadata: Metadata = {
  title: "Original Apex Applications site (archive view)",
  robots: { index: false, follow: false },
};

/** The pre-September-7 homepage, restored read-only so it can be compared. */
export default function OriginalPage() {
  return <OriginalLandingPage />;
}
