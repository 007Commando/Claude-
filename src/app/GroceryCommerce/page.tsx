import type { Metadata } from "next";
import GroceryCommerce from "../../components/GroceryCommerce";

export const metadata: Metadata = {
  title: "GroceryCommerce — Enterprise B2B Amazon Grocery Software | Apex Applications",
  description:
    "The #1 software for B2B Amazon and ecommerce grocery at enterprise scale: restock and purchase order creation, cashflow and inventory turnover, expiration tracking, and automatic repricing under one roof. $1M+ monthly sales minimum.",
  alternates: { canonical: "https://apexapplications.io/GroceryCommerce" },
};

export default function Page() {
  return <GroceryCommerce />;
}
