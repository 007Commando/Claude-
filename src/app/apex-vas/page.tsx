import type { Metadata } from "next";
import ApexVasPromo from "../../components/ApexVasPromo";

export const metadata: Metadata = {
  title: "14 days free with a professional Amazon VA | Apex Applications",
  description:
    "Put a trained Amazon wholesale VA to work in your business free for 14 days. Account audits, product research, supplier management, restocking, repricing and more, with 20+ years of Amazon experience across the team.",
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
  return <ApexVasPromo />;
}
