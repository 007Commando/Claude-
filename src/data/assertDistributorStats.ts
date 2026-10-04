import { categories, distributors } from "./distributors";
import { DISTRIBUTOR_CATEGORIES, DISTRIBUTOR_COUNT } from "./distributorStats";

/** Fails the build if distributorStats.ts no longer matches the real list. Server only. */
export function assertDistributorStats() {
  const same =
    distributors.length === DISTRIBUTOR_COUNT &&
    categories.length === DISTRIBUTOR_CATEGORIES.length &&
    categories.every((c, i) => c === DISTRIBUTOR_CATEGORIES[i]);
  if (!same) {
    throw new Error(
      `src/data/distributorStats.ts is out of date: the list has ${distributors.length} distributors in ${categories.length} categories. Update DISTRIBUTOR_COUNT and DISTRIBUTOR_CATEGORIES.`,
    );
  }
}
