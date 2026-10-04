import type { FbaProduct } from "./types";

/**
 * Inbound placement fees: what it costs per unit to send stock into Amazon in
 * fewer than the number of warehouses Amazon would choose.
 *
 * The table is the one Apex uses inside the product, in the same order:
 * [size tier, heaviest weight in pounds, fees]. A row with no size tier
 * applies to any tier. The nine fees are East, Central and West, each for one,
 * two and three locations.
 *
 * "Amazon optimised" splits carry no placement fee, which is why that choice
 * has no entry here.
 */
export type Region = "us-east" | "us-central" | "us-west";
export type SplitPlan = "minimal" | "partial2" | "partial3" | "optimized";

type Row = readonly [FbaProduct["sizeTier"], number, readonly number[]];

const ROWS: readonly Row[] = [
  ["standard_small", 1, [0.16, 0.26, 0.3, 0.15, 0.21, 0.21, 0.15, 0.15, 0.21]],
  ["standard_large", 0.75, [0.18, 0.28, 0.34, 0.17, 0.23, 0.24, 0.16, 0.16, 0.24]],
  ["standard_large", 1.5, [0.22, 0.33, 0.41, 0.21, 0.26, 0.28, 0.19, 0.19, 0.28]],
  ["standard_large", 3, [0.27, 0.38, 0.49, 0.24, 0.31, 0.34, 0.22, 0.22, 0.34]],
  ["standard_large", 20, [0.37, 0.51, 0.68, 0.32, 0.42, 0.48, 0.29, 0.29, 0.48]],
  [null, 5, [2.16, 2.4, 2.67, 0.77, 1.21, 1.48, 1.11, 1.11, 1.48]],
  [null, 12, [2.55, 2.9, 3.15, 1, 1.5, 1.75, 1.22, 1.22, 1.75]],
  [null, 28, [3.19, 3.45, 3.95, 1.1, 1.8, 2.19, 1.3, 1.3, 2.19]],
  [null, 42, [4.13, 4.5, 5.11, 1.5, 2.3, 2.83, 2, 2, 2.83]],
  [null, 50, [4.85, 5.3, 6, 2, 2.9, 3.32, 2.5, 2.5, 3.32]],
];

const REGIONS: Region[] = ["us-east", "us-central", "us-west"];
const SPLITS: Record<Exclude<SplitPlan, "optimized">, number> = { minimal: 0, partial2: 1, partial3: 2 };

/** Per-unit placement fee, or null when the product's size or weight is unknown. */
export const placementFee = (
  weightPounds: number | null,
  sizeTier: FbaProduct["sizeTier"],
  region: Region,
  plan: SplitPlan,
): number | null => {
  if (plan === "optimized") return 0;
  if (weightPounds === null || !Number.isFinite(weightPounds)) return null;
  const row = ROWS.find(([tier, maxWeight]) => (tier && sizeTier !== tier ? false : weightPounds <= maxWeight));
  // Heavier than the table covers (extra-large items): Amazon charges none.
  if (!row) return 0;
  return row[2][REGIONS.indexOf(region) * 3 + SPLITS[plan]];
};
