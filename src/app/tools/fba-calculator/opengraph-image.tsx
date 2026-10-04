import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../../lib/og/card";

export const alt = "Free Amazon FBA Calculator";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Free tool",
    title: "Free Amazon FBA Calculator",
    subtitle: "Paste an ASIN: price history, sales rank, every Amazon fee and your real profit.",
  });
}
