import type { Metadata } from "next";
import LandingPage from "../components/LandingPage";
import { absoluteUrl } from "../config/site";

/**
 * The homepage had no metadata of its own and lived off the root layout's,
 * including a canonical that every other page inherited too. That canonical has
 * moved here, where it is a statement about one page rather than a default
 * applied to all of them.
 */
export const metadata: Metadata = {
  title: "Amazon Wholesale Seller Software | Apex Applications",
  description:
    "Research supplier catalogues, manage purchasing, understand profit and reprice your listings with Apex Applications. Start with the job you need today.",
  alternates: { canonical: absoluteUrl("/") },
};

export default function Page() {
  return <LandingPage />;
}
