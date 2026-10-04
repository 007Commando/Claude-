import { fulfillmentFee, referralFee } from "./fees";
import type { FbaProduct } from "./types";

export interface CalcInput {
  price: number;
  /** What the seller pays per unit to buy the product. */
  cogs: number;
  /** Prep and labeling per unit. */
  prep: number;
  /** Their own cost of shipping each unit to Amazon. */
  inbound: number;
  /** Anything else per unit. */
  other: number;
  /** Amazon's inbound placement fee per unit. */
  placement: number;
  /** Replaces the looked-up FBA fee when the seller has Amazon's own figure. */
  fbaOverride: number | null;
  units: number;
}

export interface CalcResult {
  referral: number;
  fba: number | null;
  placement: number;
  amazonFees: number;
  costs: number;
  profit: number;
  margin: number | null;
  roi: number | null;
  breakEven: number | null;
  totalProfit: number;
  totalInvestment: number;
}

const profitAt = (price: number, product: FbaProduct, input: CalcInput): number => {
  const referral = referralFee(price, product.category, product.subcategory);
  const fba = input.fbaOverride ?? fulfillmentFee(price, product.fulfillmentFee) ?? 0;
  return price - referral - fba - input.placement - (input.cogs + input.prep + input.inbound + input.other);
};

/**
 * The selling price at which profit is exactly zero. Referral and fulfillment
 * fees both change with price, in steps, so there is no tidy formula; this
 * searches for it. Profit rises with price, which is what makes that safe.
 */
const breakEvenPrice = (product: FbaProduct, input: CalcInput): number | null => {
  let low = 0.01;
  let high = Math.max(input.price * 4, 50);
  if (profitAt(high, product, input) < 0) return null;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (profitAt(mid, product, input) >= 0) high = mid;
    else low = mid;
  }
  return Math.round(high * 100) / 100;
};

export const compute = (product: FbaProduct, input: CalcInput): CalcResult => {
  const referral = referralFee(input.price, product.category, product.subcategory);
  const fba = input.fbaOverride ?? fulfillmentFee(input.price, product.fulfillmentFee);
  const amazonFees = referral + (fba ?? 0) + input.placement;
  const costs = input.cogs + input.prep + input.inbound + input.other;
  const profit = input.price - amazonFees - costs;
  const units = Math.max(1, Math.floor(input.units) || 1);
  return {
    referral,
    fba,
    placement: input.placement,
    amazonFees,
    costs,
    profit,
    margin: input.price > 0 ? profit / input.price : null,
    roi: costs > 0 ? profit / costs : null,
    breakEven: breakEvenPrice(product, input),
    totalProfit: profit * units,
    totalInvestment: costs * units,
  };
};

/** Plain-language reads of the history, computed from the figures themselves. */
export const priceRead = (product: FbaProduct) => {
  const { buyBox, avg30, avg60, avg90 } = product.price;
  const points = [buyBox, avg30, avg60, avg90].filter((v): v is number => v !== null);
  if (points.length < 2 || buyBox === null || avg90 === null) return null;
  const vsAvg = (buyBox - avg90) / avg90;
  const swing = (Math.max(...points) - Math.min(...points)) / Math.min(...points);
  return { vsAvg90: vsAvg, swing };
};

export const rankRead = (product: FbaProduct) => {
  const { avg30, avg90 } = product.rank;
  if (avg30 === null || avg90 === null) return null;
  // A lower rank number is better, so "improving" is the 30-day figure
  // sitting below the 90-day one.
  return { change: (avg30 - avg90) / avg90 };
};
