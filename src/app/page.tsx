import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import HomeV2 from "../components/v2/Home";

/**
 * The homepage had no metadata of its own and lived off the root layout's,
 * including a canonical that every other page inherited too. That canonical has
 * moved here, where it is a statement about one page rather than a default
 * applied to all of them.
 */
export const metadata: Metadata = pageMetadata({
  title: "Amazon Wholesale Software for Sourcing, Purchasing & Profit | Apex",
  description:
    "Scan supplier price lists, turn the best products into purchase orders, track real profit and restocks, and ask ChatGPT or Claude about your own Apex data.",
  path: "/",
});

export default function Page() {
  return <HomeV2 />;
}
