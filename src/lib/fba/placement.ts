import type { FbaProduct } from "./types";

/**
 * Inbound placement fees: what it costs per unit to send stock into Amazon in
 * fewer than the number of warehouses Amazon would choose.
 *
 * Amazon's 2026 schedule (in force for shipping plans created on or after
 * 15 January 2026, from its "FBA inbound placement service fee" help page).
 * Amazon publishes a range per size tier and weight band, not a price per
 * region, and says the West costs the most. So East is the bottom of each
 * published range, West the top and Central the midpoint: close, not exact.
 * The exact figure for a plan is the one Send to Amazon and the Revenue
 * Calculator quote.
 *
 * Rows are [size tier, heaviest weight in pounds, fees]. The nine fees run
 * one location (East, Central, West), then two locations, then three. Amazon
 * prices "two or three locations" as one partial-split option, and only for
 * bulky products, so standard-size rows repeat the one-location fee. Extra-large
 * products and Amazon-optimised splits carry no fee.
 */
export type Region = "us-east" | "us-central" | "us-west";
export type SplitPlan = "minimal" | "partial2" | "partial3" | "optimized";

type Row = readonly [FbaProduct["sizeTier"], number, readonly number[]];

const ROWS: readonly Row[] = [
  ["standard_small", 0.5, [0.14, 0.23, 0.32, 0.14, 0.23, 0.32, 0.14, 0.23, 0.32]],
  ["standard_small", 1, [0.16, 0.24, 0.32, 0.16, 0.24, 0.32, 0.16, 0.24, 0.32]],
  ["standard_large", 0.75, [0.2, 0.3, 0.4, 0.2, 0.3, 0.4, 0.2, 0.3, 0.4]],
  ["standard_large", 1.5, [0.24, 0.37, 0.5, 0.24, 0.37, 0.5, 0.24, 0.37, 0.5]],
  ["standard_large", 3, [0.34, 0.47, 0.6, 0.34, 0.47, 0.6, 0.34, 0.47, 0.6]],
  ["standard_large", 5, [0.38, 0.57, 0.76, 0.38, 0.57, 0.76, 0.38, 0.57, 0.76]],
  ["standard_large", 7, [0.4, 0.69, 0.98, 0.4, 0.69, 0.98, 0.4, 0.69, 0.98]],
  ["standard_large", 10, [0.42, 0.81, 1.2, 0.42, 0.81, 1.2, 0.42, 0.81, 1.2]],
  ["standard_large", 15, [0.44, 0.97, 1.5, 0.44, 0.97, 1.5, 0.44, 0.97, 1.5]],
  ["standard_large", 20, [0.55, 1.23, 1.9, 0.55, 1.23, 1.9, 0.55, 1.23, 1.9]],
  ["small_oversize", 5, [1.1, 1.35, 1.6, 0.55, 0.83, 1.1, 0.55, 0.83, 1.1]],
  ["small_oversize", 12, [1.75, 2.08, 2.4, 0.65, 1.2, 1.75, 0.65, 1.2, 1.75]],
  ["small_oversize", 28, [2.74, 3.12, 3.5, 0.81, 1.5, 2.19, 0.81, 1.5, 2.19]],
  ["small_oversize", 42, [3.95, 4.45, 4.95, 1.05, 1.94, 2.83, 1.05, 1.94, 2.83]],
  ["small_oversize", 50, [4.8, 5.38, 5.95, 1.23, 2.28, 3.32, 1.23, 2.28, 3.32]],
  ["large_oversize", 5, [1.3, 1.55, 1.8, 0.55, 0.9, 1.25, 0.55, 0.9, 1.25]],
  ["large_oversize", 12, [2.1, 2.5, 2.9, 0.65, 1.23, 1.8, 0.65, 1.23, 1.8]],
  ["large_oversize", 28, [3.4, 3.75, 4.1, 0.81, 1.56, 2.3, 0.81, 1.56, 2.3]],
  ["large_oversize", 42, [4.7, 5.15, 5.6, 1.05, 2, 2.95, 1.05, 2, 2.95]],
  ["large_oversize", 50, [5.5, 6, 6.5, 1.23, 2.37, 3.5, 1.23, 2.37, 3.5]],
];

const REGIONS: Region[] = ["us-east", "us-central", "us-west"];
const SPLITS: Record<Exclude<SplitPlan, "optimized">, number> = { minimal: 0, partial2: 1, partial3: 2 };

/** Per-unit placement fee, or null when the product's size tier or weight is unknown. */
export const placementFee = (
  weightPounds: number | null,
  sizeTier: FbaProduct["sizeTier"],
  region: Region,
  plan: SplitPlan,
): number | null => {
  if (plan === "optimized") return 0;
  if (weightPounds === null || !Number.isFinite(weightPounds) || sizeTier === null) return null;
  const row = ROWS.find(([tier, maxWeight]) => (tier && sizeTier !== tier ? false : weightPounds <= maxWeight));
  // Heavier or larger than the table covers (extra-large items): Amazon charges none.
  if (!row) return 0;
  return row[2][SPLITS[plan] * 3 + REGIONS.indexOf(region)];
};
