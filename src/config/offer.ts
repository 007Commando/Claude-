/**
 * The one place the website states what Apex costs and what a trial gives you.
 *
 * These numbers were previously retyped in a dozen components — pricing cards,
 * every comparison table, the checkout page, the schema block in the root
 * layout — which is how a site ends up telling one visitor the repricer is
 * included and another that it is not. Every price, trial length and plan
 * claim on the marketing site now reads from here.
 *
 * Two kinds of fact live in this file and they are labelled, because they carry
 * different risk:
 *
 *   VERIFIED   Read out of the application's own code. Changing the product
 *              changes these, so they are cited with the file that decides them.
 *   PUBLISHED  The offer as advertised. Stripe holds the authoritative amount;
 *              nothing here can prove it, so these must be reconciled against
 *              the live Price objects before any campaign spends money on them.
 */

/**
 * VERIFIED — backend `controllers/api/auth.ts` and
 * `services/stripe/subscriptions.ts` all create the subscription with
 * `trial_period_days: 7`. Three call sites, one value.
 */
export const TRIAL_DAYS = 7;

/**
 * VERIFIED — checkout runs in Stripe `mode: "subscription"` with
 * `payment_method_types: ["card"]` and
 * `trial_settings.end_behavior.missing_payment_method: "cancel"`. A card is
 * collected before the trial starts; it is simply not charged until the trial
 * ends.
 *
 * The site must therefore never say "no card required". "No card charged for
 * seven days" is the accurate phrasing and is what the copy uses.
 */
export const TRIAL_REQUIRES_CARD = true;

/**
 * VERIFIED — every route in `routes/api/gold.ts` is gated by `subRequired()`
 * with no plan argument, and that middleware admits any account holding any
 * active subscription. The repricer is therefore included in every paid plan,
 * Starter included.
 *
 * This resolves the contradiction the SEO audit flagged: the pricing matrix
 * omitted Gold while the comparison pages claimed it was included. The
 * comparison pages were right.
 */
export const GOLD_INCLUDED_IN_EVERY_PLAN = true;

export interface Plan {
  id: "starter" | "pro";
  name: string;
  /** PUBLISHED — monthly price in USD. Must match the live Stripe Price. */
  monthly: number;
  /** Who the plan is shaped for, in the buyer's terms rather than ours. */
  fitsWho: string;
  href: string;
}

/**
 * PUBLISHED — the two plans the website sells.
 *
 * The billing system also defines `plus` and `enterprise` tiers with live
 * Stripe prices. They are deliberately not listed: the site has never
 * advertised them, and publishing a plan whose limits nobody has written down
 * would create exactly the kind of unverifiable claim this file exists to
 * prevent. Ask the product owner before surfacing either.
 */
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 149.99,
    fitsWho: "Sellers building their first supplier catalogue and purchase orders.",
    href: "/pricing",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 299,
    fitsWho: "Teams running several suppliers and marketplaces at once.",
    href: "/pricing",
  },
];

export const planById = (id: Plan["id"]): Plan =>
  PLANS.find((plan) => plan.id === id) ?? PLANS[0];

/** PUBLISHED — the discount applied when a plan is billed yearly. */
export const ANNUAL_DISCOUNT_PERCENT = 20;

/** `$149.99`, `$299` — trailing `.00` dropped, because prices read as prices. */
export const formatPrice = (amount: number): string =>
  `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;

/**
 * The sentence that appears under a trial button.
 *
 * One string, so the terms beside every CTA on the site say the same thing. It
 * names the card deliberately: burying that until the checkout screen is the
 * complaint that turns a trial signup into a chargeback.
 */
export const trialTerms = (planId: Plan["id"] = "starter"): string => {
  const plan = planById(planId);
  return `${TRIAL_DAYS} days free, then ${formatPrice(plan.monthly)} a month. Card required, nothing charged until day ${TRIAL_DAYS + 1}. Cancel any time before then.`;
};

/** Short form, for places with no room for the full terms. */
export const trialCta = `Start my ${TRIAL_DAYS}-day trial`;

/**
 * The entry price, for comparison tables that quote "from".
 *
 * Derived rather than retyped: a comparison page that quotes a stale entry
 * price against a competitor's current one is the single most damaging kind of
 * error on this site, because it is the number a buyer checks.
 */
export const entryPrice = (): string =>
  `${formatPrice(planById("starter").monthly)}/mo`;

/**
 * PUBLISHED — the limits the billing system actually enforces.
 *
 * Transcribed on September 14, 2026 from `subscriptionLimits` in the backend
 * (`services/stripe/check.ts`), which is the code that runs when somebody picks
 * a plan. It is the source because it is the thing that decides.
 *
 * The matrix on the pricing page had been showing the next tier up in every
 * row: Starter advertised Pro's ASIN allowance and Pro's seat count, Pro
 * advertised Enterprise's. Monthly sales was worse than shifted — $50K against
 * an enforced $10K, and crossing the enforced figure does not warn, it moves
 * the customer onto Plus.
 *
 * Two things are deliberately not here. `plus` and `enterprise` exist in
 * billing but the site does not sell them, for the reason given above PLANS.
 * And no marketplace limit appears anywhere in the billing code, so the
 * "2 / 3 marketplaces" row on the pricing page is unverified — it needs a
 * product answer, not a guess.
 */
export interface PlanLimits {
  /** Trailing monthly sales, in USD. `null` means no enforced ceiling. */
  monthlySales: number | null;
  /** ASINs the account may hold in its database. */
  housedAsins: number;
  /** Prep centre / warehouse connections. */
  prepCenterConnections: number;
  /** Seats included before the per-seat charge applies. */
  authorizedUsers: number;
}

export const PLAN_LIMITS: Record<Plan["id"], PlanLimits> = {
  starter: {
    monthlySales: 10_000,
    housedAsins: 1_000,
    prepCenterConnections: 1,
    authorizedUsers: 1,
  },
  pro: {
    monthlySales: null,
    housedAsins: 4_000,
    prepCenterConnections: 3,
    authorizedUsers: 5,
  },
};

/** `$10K`, `Unlimited` — the sales ceiling as a pricing table should say it. */
export const salesCeilingLabel = (planId: Plan["id"]): string => {
  const ceiling = PLAN_LIMITS[planId].monthlySales;
  if (ceiling === null) return "Unlimited";
  return `Up to $${(ceiling / 1000).toFixed(0)}K/mo in revenue`;
};

/** `1,000 ASINs` — thousands separated, because these are counted figures. */
export const countLabel = (value: number, noun: string): string =>
  `${value.toLocaleString("en-US")} ${noun}`;
