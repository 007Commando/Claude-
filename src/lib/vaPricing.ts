/**
 * The one source of truth for VA service pricing.
 *
 * The page renders its quote from these numbers and the checkout route
 * recomputes the charge from them — the client sends only its schedule
 * choices, never an amount, so nothing a browser can tamper with decides
 * what Stripe charges.
 */

export const PART_TIME_RATE = 7.0;
export const FULL_TIME_RATE = 5.5;
export const QUARTERLY_DISCOUNT = 0.05;
export const DAYS_PER_WEEK = 5;
export const MIN_WEEKLY_HOURS = 20;
export const FULL_TIME_WEEKLY_HOURS = 40;
export const WEEKS_PER_QUARTER = 13;
// Billing runs monthly. A month is 52/12 weeks -- flat four would quietly
// drop four weeks of work a year from the price.
export const WEEKS_PER_MONTH = 52 / 12;
/**
 * Card processing on SERVICE offers only (VA hours and the like), not the
 * software plans. Folded into every quoted figure so the page and the charge
 * always agree.
 */
export const CARD_FEE_RATE = 0.04;

export interface VaProfile {
  name: string;
  role: string;
  available: boolean;
  /** Working window in EST, 24h clock. */
  windowStart: number;
  windowEnd: number;
  skills: { label: string; score: number }[];
}

export const VAS: VaProfile[] = [
  {
    name: "Amir",
    role: "Amazon Wholesale VA",
    available: true,
    windowStart: 9,
    windowEnd: 15,
    skills: [
      { label: "Pricing knowledge", score: 10 },
      { label: "Catalog management", score: 10 },
      { label: "Product research", score: 8 },
      { label: "Account health", score: 8 },
      { label: "Distributor outreach", score: 7 }
    ]
  }
];

export const hourLabel = (hour: number) => {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${hour < 12 ? "AM" : "PM"} EST`;
};

export interface VaQuote {
  va: VaProfile;
  dailyHours: number;
  weeklyHours: number;
  /** Effective hourly rate after any quarterly discount, before card fee. */
  rate: number;
  monthlyCost: number;
  quarterlyCost: number;
  quarterlySavings: number;
  /** What Stripe should charge per billing period, in cents. */
  chargeCents: number;
  scheduleLabel: string;
}

export type VaQuoteResult = { ok: true; quote: VaQuote } | { ok: false; error: string };

/**
 * Price a schedule, enforcing the same rules the page's selectors encode:
 * hours are one consecutive daily block inside the VA's window, Mon-Fri, at
 * least 20 a week.
 */
export function computeVaQuote(input: {
  vaName: string;
  startHour: number;
  endHour: number;
  quarterly: boolean;
}): VaQuoteResult {
  const va = VAS.find((candidate) => candidate.name === input.vaName);
  if (!va) return { ok: false, error: "Unknown VA" };
  if (!va.available) return { ok: false, error: `${va.name} is fully booked right now` };

  const { startHour, endHour, quarterly } = input;
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
    return { ok: false, error: "Hours must be whole hours" };
  }
  if (startHour < va.windowStart || endHour > va.windowEnd || endHour <= startHour) {
    return { ok: false, error: `${va.name} works ${hourLabel(va.windowStart)} to ${hourLabel(va.windowEnd)}` };
  }

  const dailyHours = endHour - startHour;
  const weeklyHours = dailyHours * DAYS_PER_WEEK;
  if (weeklyHours < MIN_WEEKLY_HOURS) {
    return { ok: false, error: `Minimum is ${MIN_WEEKLY_HOURS} hours a week` };
  }

  const fullTime = weeklyHours >= FULL_TIME_WEEKLY_HOURS;
  const baseRate = fullTime ? FULL_TIME_RATE : PART_TIME_RATE;
  const rate = baseRate * (quarterly ? 1 - QUARTERLY_DISCOUNT : 1);
  const withFee = 1 + CARD_FEE_RATE;

  const monthlyCost = weeklyHours * rate * WEEKS_PER_MONTH * withFee;
  const quarterlyCost = weeklyHours * rate * WEEKS_PER_QUARTER * withFee;
  const quarterlySavings = weeklyHours * baseRate * WEEKS_PER_QUARTER * withFee * QUARTERLY_DISCOUNT;

  return {
    ok: true,
    quote: {
      va,
      dailyHours,
      weeklyHours,
      rate,
      monthlyCost,
      quarterlyCost,
      quarterlySavings,
      chargeCents: Math.round((quarterly ? quarterlyCost : monthlyCost) * 100),
      scheduleLabel: `Mon-Fri, ${hourLabel(startHour)} to ${hourLabel(endHour)} (${dailyHours} hrs/day, ${weeklyHours} hrs/week)`
    }
  };
}
