import type { Metadata } from "next";
import ApexVas from "../../components/ApexVas";

export const metadata: Metadata = {
  title: "Apex VAs. Trained Amazon Virtual Assistants | Apex Applications",
  description:
    "Hire a trained Amazon wholesale VA who works inside your Apex account. Part-time from $7/hour, full-time from $5.50/hour, 5% off paid quarterly.",
  alternates: { canonical: "https://www.apexapplications.io/apex-vas" },
  /**
   * Footer-only, and now deliberately so rather than provisionally.
   *
   * `/virtual-assistants` was opened to search and put in the sitemap. This
   * page sells the same service, so indexing both would put two of our own
   * pages in the same auction for the same query. One of them is the
   * indexable one; this is the other.
   */
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ApexVas />;
}
