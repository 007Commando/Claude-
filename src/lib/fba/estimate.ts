/**
 * Monthly unit sales, inferred from Best Sellers Rank.
 *
 * Amazon does not publish sales volume, so this is a model, not a measurement:
 * units ≈ anchor × rank^-0.75, where the anchor depends on how big the
 * category is. It is shown as a bracket on purpose. "137 units" would claim a
 * precision the method does not have; "100 to 300" says what is actually known.
 * The same curve Apex falls back on inside the product.
 */
export interface SalesBracket {
  low: number;
  high: number | null;
  label: string;
}

const LARGE = [
  "books",
  "clothing",
  "home & kitchen",
  "beauty & personal care",
  "health & household",
  "grocery & gourmet food",
  "toys & games",
  "electronics",
  "sports & outdoors",
  "tools & home improvement",
  "cell phones & accessories",
];
const SMALL = [
  "appliances",
  "collectibles & fine art",
  "handmade products",
  "musical instruments",
  "software",
  "video games",
  "industrial & scientific",
];

const BRACKETS: [number, number | null][] = [
  [0, 5],
  [5, 10],
  [10, 25],
  [25, 50],
  [50, 100],
  [100, 300],
  [300, 500],
  [500, 1000],
  [1000, null],
];

const anchorFor = (category: string | null) => {
  if (!category) return 40_000;
  const key = category.trim().toLowerCase();
  if (LARGE.some((name) => key.includes(name))) return 90_000;
  if (SMALL.some((name) => key.includes(name))) return 15_000;
  return 40_000;
};

export const estimateMonthlySales = (rank: number | null, category: string | null): SalesBracket | null => {
  if (!rank || !Number.isFinite(rank) || rank <= 0) return null;
  const raw = anchorFor(category) * Math.pow(rank, -0.75);
  const bracket = BRACKETS.find(([low, high]) => raw >= low && (high === null || raw < high));
  if (!bracket) return null;
  const [low, high] = bracket;
  return {
    low,
    high,
    label: high === null ? `${low.toLocaleString("en-US")}+` : `${low.toLocaleString("en-US")} to ${high.toLocaleString("en-US")}`,
  };
};
