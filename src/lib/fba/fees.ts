import type { FbaProduct } from "./types";

/**
 * Amazon's referral fee for a product at a given price.
 *
 * A direct port of the rules Apex's own product database uses
 * (referralFeeQuery in the backend), in the same order and with the same
 * thresholds, so a number on this page is the number Apex shows inside the
 * product. Category and subcategory are matched exactly as stored. The first
 * rule that applies wins, as in the SQL.
 */
export const referralFee = (
  rawPrice: number,
  category: string | null,
  subcategory: string | null,
): number => {
  const price = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;
  const cat = category ?? "";
  const sub = subcategory ?? "";
  const has = (needle: string) => sub.toLowerCase().includes(needle);
  const min = Math.min;
  const max = Math.max;

  if (cat === "Amazon Devices & Accessories") return max(0.45 * price, 0.3);
  if (["Software", "CDs & Vinyl", "Movies & TV", "Audible Books", "Books"].includes(cat))
    return max(0.15 * price, 0);
  if (has("watch")) return max(0.16 * min(price, 1500) + 0.03 * max(price - 1500, 0), 0.3);
  if (cat === "Automotive") return max((sub === "Tires" ? 0.1 : 0.12) * price, 0.3);
  if (["Baby", "Beauty & Personal Care", "Health & Household"].includes(cat))
    return price <= 10 ? max(0.08 * price, 0.3) : max(0.15 * price, 0.3);
  if (
    cat === "Tools & Home Improvement" &&
    ["Power Tools & Hand Tools", "Power Tools (Tools & Home Improvement)"].includes(sub)
  )
    return max(0.12 * price, 0.3);
  if (cat === "Industrial & Scientific") return max(0.12 * price, 0.3);
  if (cat === "Clothing, Shoes & Jewelry") {
    if (has("jewelry")) return max(0.2 * min(price, 250) + 0.05 * max(price - 250, 0), 0.3);
    if (price <= 15) return max(0.05 * price, 0.3);
    if (price <= 20) return max(0.1 * price, 0.3);
    return max(0.17 * price, 0.3);
  }
  if (cat === "Appliances") {
    const heavy = [
      "Compact Refrigerators",
      "Portable Dryers",
      "Portable Dishwashers",
      "Countertop Dishwashers",
      "Shaved Ice Machines",
      "Ice Makers",
      "Portable Clothes Washing Machines",
      "Beverage Refrigerators",
    ];
    return heavy.includes(sub)
      ? max(0.15 * min(price, 300) + 0.08 * max(price - 300, 0), 0.3)
      : max(0.08 * price, 0.3);
  }
  if (["Computers & Accessories", "Electronics"].includes(cat)) return max(0.08 * price, 0.3);
  if (cat === "Cell Phones & Accessories")
    return max(0.15 * min(price, 100) + 0.08 * max(price - 100, 0), 0.3);
  if (sub === "Fine Art")
    return max(
      0.2 * min(price, 100) + 0.15 * min(max(price - 100, 0), 900) + 0.1 * max(price - 1000, 0),
      0.3,
    );
  if (cat === "Grocery & Gourmet Food")
    return price <= 15 ? max(0.08 * price, 0.3) : max(0.15 * price, 0.3);
  if (cat === "Pet Supplies") return max((has("veterinary") ? 0.22 : 0.15) * price, 0.3);
  if (cat === "Video Games") return max((has("console") ? 0.08 : 0.15) * price, 0);
  if (has("lawn mower") || has("snow thrower"))
    return max(0.15 * min(price, 500) + 0.08 * max(price - 500, 0), 0.3);
  if (has("furniture")) return max(0.15 * min(price, 200) + 0.1 * max(price - 200, 0), 0.3);
  return max(0.15 * price, 0.3);
};

/**
 * The FBA fulfillment fee at a price. Amazon charges on three price tiers and
 * the database holds one fee for each; where a tier is missing the nearest one
 * stands in, the same fallback the product uses.
 */
export const fulfillmentFee = (rawPrice: number, tiers: FbaProduct["fulfillmentFee"]): number | null => {
  const { lowPrice, standard, highPrice } = tiers;
  if (lowPrice === null && standard === null && highPrice === null) return null;
  const price = Number.isFinite(rawPrice) ? rawPrice : 0;
  const low = lowPrice ?? standard ?? highPrice ?? 0;
  const mid = standard ?? highPrice ?? lowPrice ?? 0;
  const high = highPrice ?? standard ?? lowPrice ?? 0;
  if (price < 10) return low;
  if (price <= 50) return mid;
  return high;
};
