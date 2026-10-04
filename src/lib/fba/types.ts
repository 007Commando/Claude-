/** What the site's server returns for one ASIN (see /api/fba-calculator). */
export interface FbaProduct {
  asin: string;
  title: string | null;
  brand: string | null;
  image: string | null;
  category: string | null;
  subcategory: string | null;
  salesRank: number | null;
  subRank: number | null;
  sizeTier:
    | "standard_small"
    | "standard_large"
    | "small_oversize"
    | "large_oversize"
    | "special_oversize"
    | null;
  weightPounds: number | null;
  dimensions: { length: number; width: number; height: number; unit: string } | null;
  hazmat: boolean;
  bundle: number | null;
  price: {
    buyBox: number | null;
    avg30: number | null;
    avg60: number | null;
    avg90: number | null;
    fba: number | null;
    fbm: number | null;
  };
  rank: { current: number | null; avg30: number | null; avg60: number | null; avg90: number | null };
  sellers: { total: number | null; fba: number | null; amazonOnListing: boolean | null };
  fulfillmentFee: { lowPrice: number | null; standard: number | null; highPrice: number | null };
  referralFeeAtBuyBox: number | null;
}

export type LookupResult =
  | { status: "found"; product: FbaProduct }
  | { status: "not-found" }
  | { status: "invalid" }
  | { status: "busy" }
  | { status: "error" };
