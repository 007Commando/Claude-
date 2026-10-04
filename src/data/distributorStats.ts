/**
 * The Distributor Vault's headline numbers, safe to import into client code.
 *
 * Client components imported src/data/distributors.ts just to print a count,
 * which shipped every distributor's website and contact email to every
 * visitor's browser, behind a "members only" blur. These two values are all
 * the marketing pages need. The pages that render them check these against the
 * real list at build time (see assertDistributorStats), so the numbers cannot
 * quietly go stale when the list changes.
 */
export const DISTRIBUTOR_COUNT = 389;

export const DISTRIBUTOR_CATEGORIES = [
  "Apparel & Fashion",
  "Beauty & Cosmetics",
  "Candy & Snacks",
  "Cleaning & Janitorial",
  "Electronics",
  "General Merchandise",
  "Grocery & Food",
  "Hardware & Tools",
  "Health & Supplements",
  "Home & Houseware",
  "Office & School",
  "Outdoors & Sporting",
  "Pet Supplies",
  "Toys & Hobby",
];
