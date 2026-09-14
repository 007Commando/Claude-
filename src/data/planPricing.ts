/**
 * Monthly plan pricing, shared wherever a page needs to talk about it.
 *
 * These now read from `config/offer.ts`, which is the single source for
 * everything the site claims about the offer — price, trial length, whether a
 * card is taken, what each plan includes. This module stays because several
 * components already import from it; it no longer holds its own copy of the
 * numbers, so the two can't drift apart.
 */
import { ANNUAL_DISCOUNT_PERCENT, planById } from "../config/offer";

export const PRICE_LIMITED_M = planById("starter").monthly;
export const PRICE_UNLIMITED_M = planById("pro").monthly;
export const ANNUAL_DISCOUNT = ANNUAL_DISCOUNT_PERCENT / 100;
