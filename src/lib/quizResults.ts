/**
 * The four seller types the /apex-quiz funnel sorts people into, shared by
 * the result screen and the follow-up email so the two can never say
 * different things. Every figure is from one supplier catalog we scanned (the
 * Bilo Distributor price list shown in the ads: 12,203 lines, 2,860 profitable,
 * 120 after one filter). It is a different example catalog from the one on
 * /apex-scan (1,175 lines) and neither is presented as typical. Plan prices
 * come from offer.ts. The plan lines are recommendations, not statistics about
 * what other sellers choose (accuracy pass 2026-10-07).
 */
import { formatPrice, planById } from "../config/offer";

export type QuizResultId = "starter" | "arbitrage" | "spreadsheet" | "scaler";

export interface QuizResult {
  name: string;
  line: string;
  diagnosis: string;
  moves: string[];
  proof: [string, string];
  plan: string;
}

export const QUIZ_RESULTS: Record<QuizResultId, QuizResult> = {
  starter: {
    name: "The Starter",
    line: "You're early, which is the best time to build it right.",
    diagnosis:
      "The fastest way to burn a first inventory budget is buying products that look good and don't make money after Amazon's fees. You need suppliers who will sell to you, and a way to see the profit before you order.",
    moves: [
      "Get 3 U.S. wholesale distributors from the Distributor Vault when you start",
      "Scan a price list from one in Apex and see which products make money",
      "Build your first purchase order from the winners only",
    ],
    proof: ["2,860", "profitable products found in one supplier's price list"],
    plan: `Beginner, ${formatPrice(planById("beginner").monthly)} a month, is the plan for sellers under $5,000 a month in Amazon sales.`,
  },
  arbitrage: {
    name: "The Arbitrage Hunter",
    line: "You're good at finding deals. You're finding them one at a time.",
    diagnosis:
      "Arbitrage works, but every win has to be found again next week. Wholesale gives you the same winners to reorder every month, and one distributor's price list can hold thousands of products.",
    moves: [
      "Take one distributor's price list, the kind you'd never check by hand",
      "Let Apex check every line against Amazon's fees, Buy Box and monthly sales",
      "Keep the winners and reorder them every month",
    ],
    proof: ["12,203", "lines checked from one price list, 2,860 came back profitable"],
    plan: "Starter or Plus would suit a move into wholesale.",
  },
  spreadsheet: {
    name: "The Spreadsheet Wholesaler",
    line: "Your sourcing works. Your spreadsheet is the bottleneck.",
    diagnosis:
      "You already buy wholesale, so the products are out there. The problem is time: checking lines by hand means you only ever look at a fraction of each catalog, and the winners hide in the rest.",
    moves: [
      "Drop in the price list you already have, no reformatting",
      "Filter by profit, ROI and sales rank in one step",
      "Turn the short list into a purchase order with your real costs",
    ],
    proof: ["12,203 → 120", "lines to a short list worth buying, with one filter"],
    plan: "Starter or Plus would suit a wholesaler at your size.",
  },
  scaler: {
    name: "The Scaler",
    line: "Sourcing isn't your problem. Leaks are.",
    diagnosis:
      "At your size the money goes missing in the gaps: products running out because restock came late, fees nobody added up, and prices that never move. You need one system where buying, restocking and profit read the same numbers.",
    moves: [
      "Restock flags before a winner runs out",
      "Profit and loss by product, after every Amazon fee",
      "The repricer (beta) on every listing, floored at your real break-even",
    ],
    proof: ["Every fee", "taken out, product by product, in your own P&L"],
    plan: `Pro, ${formatPrice(planById("pro").monthly)} a month, would suit your size and includes the repricer on every listing (beta).`,
  },
};
