/**
 * Monthly plan pricing, shared wherever a page needs to talk about it.
 *
 * PickPlan renders these as the plans themselves; Apex Elite compares its
 * one-time price against them. One module, so a price change cannot leave a
 * comparison somewhere on the site doing arithmetic against a stale number.
 */
export const PRICE_LIMITED_M = 149.99;
export const PRICE_UNLIMITED_M = 299;
export const ANNUAL_DISCOUNT = 0.2;
