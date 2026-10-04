import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../lib/og/card";

export const alt = "Apex Applications: Amazon wholesale software";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Amazon wholesale software",
    title: "Source, buy, reprice and track profit in one place",
    subtitle: "UPC scanning, purchase orders, repricing, P&L and prep centers for Amazon FBA wholesale sellers.",
  });
}
