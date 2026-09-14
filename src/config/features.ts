/**
 * What each module's launch state actually is, in one place.
 *
 * The audit found comparison pages counting logistics as live while Apex Red
 * was described as beta everywhere else, and it was right: the shared workflow
 * chart hard-coded a filled "prep network" cell, so all sixteen comparisons
 * claimed a shipping capability the product pages call beta. One page saying
 * beta and another drawing a tick is not a wording problem, it is two different
 * answers to "can I buy this today".
 *
 * So the status lives here and the pages read it. Changing Red's state when it
 * launches is one edit, and no page can disagree with another in the meantime.
 */
export type LaunchState = "live" | "beta";

export const MODULE_STATUS: Record<string, LaunchState> = {
  black: "live",
  blue: "live",
  green: "live",
  gold: "live",
  /** Shipment building and prep workflow. Beta until the product owner says otherwise. */
  red: "beta",
};

export const isBeta = (module: keyof typeof MODULE_STATUS): boolean =>
  MODULE_STATUS[module] === "beta";

/**
 * PUBLISHED — the size of the product catalogue Apex searches against.
 *
 * Checked against `shared_amazon_product_data` on September 13, 2026:
 * 122,082,112 rows. Stated as "122M+" because the table grows, and a number
 * that only ever undercounts cannot become a false claim between refreshes.
 */
export const CATALOG_SIZE_LABEL = "122M+ products";
