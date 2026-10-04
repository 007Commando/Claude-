import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import GroceryCommerce from "../../components/GroceryCommerce";

export const metadata: Metadata = pageMetadata({
  title: "GroceryCommerce: B2B Amazon Grocery Software",
  description:
    "Software for B2B Amazon grocery at enterprise scale: restock and purchase orders, cashflow, expiration tracking and repricing. $1M+ monthly sales minimum.",
  path: "/GroceryCommerce",
});

export default function Page() {
  return <GroceryCommerce />;
}
