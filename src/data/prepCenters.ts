export interface PrepCenter {
  name: string;
  city: string;
  state: string;
  category: string;
  description: string;
  featured?: boolean;
  lat: number;
  long: number;
}

export const prepCenterCategories = ["Wholesale", "Private Label", "Online Arbitrage", "Retail Arbitrage"];

/**
 * Seeded from the 3 prep centers visible in the reference screenshot. The
 * reference implied a larger network (~27 partners) but only these 3 were
 * legible — send the full list (name, city/state, category, description) to
 * add the rest.
 */
export const prepCenters: PrepCenter[] = [
  {
    name: "Logistics Prep Center",
    city: "Los Angeles",
    state: "CA",
    category: "Wholesale",
    description: "West Coast hub for California-based wholesale sellers.",
    featured: true,
    lat: 34.05,
    long: -118.24,
  },
  {
    name: "CS3 Fulfillment",
    city: "Dallas",
    state: "TX",
    category: "Wholesale",
    description: "Central US distribution hub from Texas.",
    lat: 32.78,
    long: -96.8,
  },
  {
    name: "3P Shipping",
    city: "New York",
    state: "NY",
    category: "Wholesale",
    description: "East Coast hub for New York-based wholesale sellers.",
    lat: 40.71,
    long: -74.01,
  },
];

/** Rough equirectangular projection of the continental US onto a 0-100% box. */
export function projectToMapPercent(lat: number, long: number) {
  const x = ((long + 125) / 59) * 100;
  const y = ((50 - lat) / 26) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
}
