import type { Metadata } from "next";
import { Suspense } from "react";
import LeadDesk from "./LeadDesk";

// Internal tool, gated by middleware's Basic Auth — same as /dashboard.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Filters live in the URL query string (useSearchParams), which needs a
// Suspense boundary around it per Next's app router rules.
export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LeadDesk />
    </Suspense>
  );
}
