import { COMPARISONS as WRITTEN } from "./comparisons";

/**
 * The index's cards, as data.
 *
 * This lived inside CompareIndex, which is a client component, and that was
 * fine until /compare's meta description wanted to count the comparisons.
 * A server component importing a value from a "use client" module receives a
 * client reference, not the value, so the count rendered into the description
 * as a stringified function. Data that a server component needs cannot live
 * behind the client boundary, so it lives here instead.
 */
export type Card = {
  href: string;
  rival: string;
  category: string;
  frame: string;
  /** Which job the rival competes for, used to group the index. */
  module: string;
};

/**
 * The four hand-built comparisons.
 *
 * They predate the data file and keep their own components and their own
 * copy; there is nothing to gain from rewriting pages that work. They are
 * described here so the index can show every comparison in one ordering.
 */
export const HAND_BUILT: Card[] = [
  {
    href: "/compare/helium10",
    rival: "Helium 10",
    category: "Private-label suite",
    module: "/features/green",
    frame:
      "The giant of private label: keywords, listings, PPC. Apex plays the other game, third-party wholesale. The comparison is really a fork: which business are you in?",
  },
  {
    href: "/compare/junglescout",
    rival: "Jungle Scout",
    category: "Product research",
    module: "/features/green",
    frame:
      "The original niche-validation tool, for inventing your own product. Apex runs products that already exist. Bought at wholesale, repriced to break-even, restocked on math.",
  },
  {
    href: "/compare/smartscout",
    rival: "SmartScout",
    category: "Wholesale research",
    module: "/features/green",
    frame:
      "Closest to our lane: excellent brand and market analytics. The difference is what happens after research. Apex adds the purchase orders, repricer, and P&L.",
  },
  {
    href: "/compare/sellersnap",
    rival: "Seller Snap",
    category: "AI repricer",
    module: "/features/gold",
    frame:
      "A respected game-theory repricer, and only a repricer. Apex Gold reprices with break-even floors from live fees. Inside the suite the rest of your operation runs on.",
  },
];

/**
 * How many comparisons exist, for the copy that counts them.
 *
 * The number was typed into the /compare meta description, and adding two
 * pages made it wrong without touching the file that was wrong. Derived here
 * so a page can never again advertise a count the site does not have.
 */
export const COMPARISON_COUNT = HAND_BUILT.length + WRITTEN.length;

