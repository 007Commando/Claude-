import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import LandingPage from "../components/LandingPage";

/**
 * The homepage had no metadata of its own and lived off the root layout's,
 * including a canonical that every other page inherited too. That canonical has
 * moved here, where it is a statement about one page rather than a default
 * applied to all of them.
 */
export const metadata: Metadata = pageMetadata({
  title: "Amazon Wholesale Software for Sellers | Apex",
  description:
    "Research supplier catalogs, manage purchasing, understand profit and reprice your listings in one Amazon wholesale suite. Start with the job you need.",
  path: "/",
});

export default function Page() {
  return <LandingPage />;
}
