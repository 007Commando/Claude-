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
 * VERIFIED — `services/stripe/subscriptions.ts` applies
 * `trial_period_days: 7` to a first-time customer who is not on a paid trial,
 * which is Plus and Pro.
 *
 * Starter no longer has free days: it opens with a paid phase (see
 * PAID_TRIALS). This constant is therefore no longer "the trial" — it is the
 * free one, and copy that quotes it must say which plan it belongs to.
 */
export const TRIAL_DAYS = 7;

/**
 * PUBLISHED — the FBA Starter Bundle: one payment, no subscription.
 *
 * The price and the Stripe link live together because they have to agree, and
 * two pages now sell it: /fba-starter-bundle and the paid variant of the
 * course landing page.
 */
/**
 * The paid trial's Stripe payment link — where a signup for a paid plan begins.
 *
 * Card first, account second. Kept here rather than in the one page that
 * happened to be rebuilt that way, because every CTA on the site sells the
 * same trial and they were not all pointing at it: the header's own Sign Up
 * link, every blog CTA and every comparison page still sent people to the form
 * first, which produced accounts with no card on them.
 *
 * `plink_1UGPEG09vRtiSO1Rkarn5mhs`, Starter monthly with 7 free days. Its
 * redirect returns to /auth with `session_id`, which is what the signup form
 * reads to attach the subscription — so this and that redirect change together
 * or not at all.
 */
export const TRIAL_CHECKOUT_URL = "https://buy.stripe.com/cNi00bcro9in6GS1Yvdwc0i";

export const BUNDLE_PRICE = 29;
export const BUNDLE_CHECKOUT_URL = "https://buy.stripe.com/7sY9ALcrobqvc1c6eLdwc0a";

/**
 * PUBLISHED — a paid first phase, charged once, in place of free days.
 *
 * Starter opens at $1 for 5 days and then bills monthly. Stripe has no "trial
 * at a price", so this is a two-phase subscription schedule: the phase price
 * is charged once and the plan price follows. Plus has the same shape at $1
 * for 3 days, reachable only from a funnel link rather than the plan picker,
 * so it is deliberately not described on this page.
 */
export interface PaidTrial {
  days: number;
  price: number;
}

/**
 * Whether the repriced offer exists in Stripe yet.
 *
 * The site must never quote a price checkout will not honour, and the new
 * Prices are not created: the paid-trial and monthly price ids in the backend
 * are still empty strings, so a signup today is charged the old $149.99 and
 * given seven free days. Until those ids are filled in, this file keeps
 * publishing what is actually charged.
 *
 * Flip this and the Stripe ids together, never one without the other. It is a
 * single switch precisely so the two cannot drift.
 */
export const NEW_PRICING_LIVE = false;

export const PAID_TRIALS: Partial<Record<Plan["id"], PaidTrial>> = NEW_PRICING_LIVE
  ? {starter: {days: 5, price: 1}}
  : {};

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
 * The $1 week (Stefano, 2026-09-29): Apex Pop leads start Plus at $1 for their
 * first 7 days, and if they cancel inside the week the dollar is refunded.
 * Then Plus monthly.
 *
 * The backend sells it on offer=paid-trial (services/stripe/dollarWeek.ts)
 * with a $1 weekly price that exists in test mode only. Until the live price
 * id is filled in (paidTrialConfigurations.live.plus), a signup asking for
 * the week silently gets Plus's seven free days instead, so the site must not
 * promise it: `live` stays false until that id and this switch flip together.
 *
 * Live since 2026-10-02: the week is price_1UMFEG09vRtiSO1RDxceQ7v8 and the
 * schedule then rolls onto Plus at $149/month (price_1UMFMj09vRtiSO1RaM1DIvNM,
 * the backend's thenPriceId), not the $199 regular Plus charges. `thenPrice`
 * is that $149. Stripe's own checkout text reads the price from Stripe; this
 * copy of the number is for the pages before checkout and must match it.
 *
 * Preview before launch with ?dollarweek=1 on /apex-pop/start.
 */
export const DOLLAR_WEEK = {
  live: true,
  plan: "plus" as const,
  planLabel: "Plus",
  period: "monthly" as const,
  offer: "paid-trial" as const,
  days: 7,
  price: 1,
  thenPrice: 149,
};

/**
 * VERIFIED — the repricer is a Pro feature. `repricedListings` in the
 * backend's `services/plans/entitlements.ts` allows Beginner 1 listing,
 * Starter 0, Plus 5 and Pro unlimited, enforced when a listing is switched on.
 * The site said "every plan, Starter included" until 2026-10-05, which a
 * Starter customer would find refused the first time they tried.
 */
export const GOLD_INCLUDED_IN_EVERY_PLAN = false;
export const REPRICED_LISTINGS: Record<"beginner" | "starter" | "pro", number | null> = {
  beginner: 1,
  starter: 0,
  pro: null,
};

export interface Plan {
  id: "beginner" | "starter" | "plus" | "pro";
  name: string;
  /** PUBLISHED — monthly price in USD. Must match the live Stripe Price. */
  monthly: number;
  /** Who the plan is shaped for, in the buyer's terms rather than ours. */
  fitsWho: string;
  href: string;
}

/**
 * PUBLISHED — the three plans the website sells.
 *
 * Plus joins them: it was previously withheld because nobody had written down
 * what it allows, and that is no longer true — the limits below are enforced
 * by `services/plans/entitlements.ts`, which the app reads on every gated
 * action. Enterprise is still not listed, for the original reason.
 *
 * Starter was $149.99 and is now $69. Customers already on the old price stay
 * on it; Stripe does not reprice an existing subscription when the Price
 * changes, and no migration was asked for. So this figure is what a new
 * customer pays, which is what a pricing page is for.
 *
 * The pre-repricing figure is $149, not $149.99. Reconciled against the live
 * Price `price_1SxxtV09vRtiSO1RFrsNK8Cd` on September 16, 2026, which is
 * `unit_amount: 14900` and is the Price both our own checkout and the
 * zero-to-hero payment link charge. The site had been quoting 99 cents that
 * nobody was ever billed -- harmless to the customer, but it is exactly the
 * kind of drift this file exists to catch, and a page that overstates its own
 * price is a page that cannot be trusted on the ones that matter.
 */
export const PLANS: Plan[] = [
  /**
   * Beginner, $49.99 a month, monthly only (Stefano, 2026-10-05): for sellers
   * under $5,000 a month in Amazon sales. Live Price
   * `price_1UNLED09vRtiSO1RLRpFJvqm` (`unit_amount: 4999`, tax exclusive).
   * Seven free days like the other plans.
   */
  {
    id: "beginner",
    name: "Beginner",
    monthly: 49.99,
    fitsWho: "New sellers under $5,000 a month in Amazon sales.",
    href: "/pricing",
  },
  {
    id: "starter",
    name: "Starter",
    monthly: NEW_PRICING_LIVE ? 69 : 149,
    fitsWho: "Sellers building their first supplier catalogue and purchase orders.",
    href: "/pricing",
  },
  {
    id: "plus",
    name: "Plus",
    monthly: 149,
    // Not shown on the pricing page yet: the live Stripe amount for Plus has
    // not been confirmed against this figure, and the comparison table has no
    // column for it. See PLANS_SHOWN below.
    fitsWho: "Sellers scanning whole supplier catalogues and reconciling every delivery.",
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

/**
 * The plans the pricing page actually displays.
 *
 * Plus is defined above but withheld here until its live Stripe amount is
 * confirmed and the comparison table has a column for it. Publishing a third
 * price nobody has reconciled is the mistake this file exists to prevent.
 */
export const PLANS_SHOWN: Plan[] = PLANS.filter((plan) => plan.id !== "plus");

export const planById = (id: Plan["id"]): Plan =>
  PLANS.find((plan) => plan.id === id) ?? PLANS[0];

/**
 * PUBLISHED — the discount applied when a plan is billed yearly.
 *
 * None. The app bills a year at twelve months' price ($1,788 Starter, $3,588
 * Pro, from PLANS_PRICES in the frontend's subscriptions config), and the site
 * had been promising 20% off it. Matched to the app on Stefano's word,
 * 2026-10-05. Copy that mentions a saving checks this first.
 */
export const ANNUAL_DISCOUNT_PERCENT = 0;

/** `$149.99`, `$299` — trailing `.00` dropped, because prices read as prices. */
export const formatPrice = (amount: number): string =>
  `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;

/**
 * Stripe Tax is enabled on checkout, so the total a buyer sees can exceed the
 * figure beside the button depending on where they are. Saying so costs four
 * words and removes the only surprise left in the flow -- an unannounced line
 * item at the moment someone is deciding to trust you is worth more in
 * abandoned checkouts than it saves in copy.
 */
export const TAX_SUFFIX = ", plus tax where applicable";

/**
 * The sentence that appears under a trial button.
 *
 * One string, so the terms beside every CTA on the site say the same thing. It
 * names the card deliberately: burying that until the checkout screen is the
 * complaint that turns a trial signup into a chargeback.
 */
export const trialTerms = (planId: Plan["id"] = "starter"): string => {
  const plan = planById(planId);
  const paid = PAID_TRIALS[planId];

  if (paid) {
    return `${formatPrice(paid.price)} for your first ${paid.days} days, then ${formatPrice(
      plan.monthly,
    )} a month${TAX_SUFFIX}. Cancel any time before day ${paid.days + 1}.`;
  }

  return `${TRIAL_DAYS} days free, then ${formatPrice(plan.monthly)} a month${TAX_SUFFIX}. Card required, nothing charged until day ${TRIAL_DAYS + 1}. Cancel any time before then.`;
};

/** Short form, for places with no room for the full terms. */
export const trialCtaFor = (planId: Plan["id"] = "starter"): string => {
  const paid = PAID_TRIALS[planId];
  return paid
    ? `Start for ${formatPrice(paid.price)}`
    : `Start my ${TRIAL_DAYS}-day trial`;
};

/** Kept for the copy that speaks for the site rather than for one plan. */
export const trialCta = trialCtaFor("starter");

/**
 * The entry price, for comparison tables that quote "from".
 *
 * Derived rather than retyped: a comparison page that quotes a stale entry
 * price against a competitor's current one is the single most damaging kind of
 * error on this site, because it is the number a buyer checks.
 */
export const entryPrice = (): string =>
  `${formatPrice(planById("beginner").monthly)}/mo`;

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
 * `plus` and `enterprise` exist in billing but the site does not sell them,
 * for the reason given above PLANS. The marketplace limit has no enforcement
 * in the billing code; it is the figure the app's own plan table states.
 */
export interface PlanLimits {
  /** Trailing monthly sales, in USD. `null` means no enforced ceiling. */
  monthlySales: number | null;
  /** Amazon marketplaces the account may connect. */
  marketplaces: number;
  /** Listings Apex monitors (the app's "Listings Being Monitored"). */
  housedAsins: number;
  /** Distinct brands searched per month. `null` means unlimited. */
  brandSearchesPerMonth: number | null;
  /** Hands-on onboarding call. No plan offers it today. */
  priorityOnboarding: boolean;
  /** Prep centre / warehouse connections. */
  prepCenterConnections: number;
  /** Seats included before the per-seat charge applies. */
  authorizedUsers: number;

  /** Review Booster requests per month. `null` means unlimited. */
  reviewRequestsPerMonth: number | null;
  /** UPC scans started per month. `null` means unlimited. */
  upcScansPerMonth: number | null;
  /** SKUs searched across those scans per month. `null` means unlimited. */
  upcSkusPerMonth: number | null;
  /** The purchase order discrepancy tab. */
  purchaseOrderDiscrepancy: boolean;
  /** CSV and Excel downloads. */
  exports: boolean;
  /** 30/60/90 day average Buy Box prices. */
  historicalBuyBoxAverages: boolean;
}

/**
 * Matched to the app's own plan comparison (Subscriptions page, frontend
 * `features/apex-black/subscriptions/index.tsx`) on 2026-10-05, at Stefano's
 * word that the app is the correct one. The site had drifted from it on
 * marketplaces (2/3 against the app's 1/2), monitored listings (Pro 20,000
 * against 4,000), Review Booster (Starter 50 a month against unlimited) and
 * priority onboarding (Pro yes against no plan). Change the app's table and
 * this together.
 */
export const PLAN_LIMITS: Record<Plan["id"], PlanLimits> = {
  /**
   * Beginner, from the backend's own table (services/plans/entitlements.ts and
   * subscriptionLimits in services/stripe/check.ts), 2026-10-05. Two months in
   * a row over $5,000 moves the account to Starter.
   */
  beginner: {
    monthlySales: 5_000,
    marketplaces: 1,
    housedAsins: 500,
    brandSearchesPerMonth: 10,
    priorityOnboarding: false,
    prepCenterConnections: 1,
    authorizedUsers: 1,
    reviewRequestsPerMonth: 20,
    upcScansPerMonth: 2,
    upcSkusPerMonth: 20_000,
    purchaseOrderDiscrepancy: false,
    exports: false,
    historicalBuyBoxAverages: false,
  },
  starter: {
    monthlySales: 10_000,
    marketplaces: 1,
    housedAsins: 1_000,
    brandSearchesPerMonth: 25,
    priorityOnboarding: false,
    prepCenterConnections: 1,
    authorizedUsers: 1,
    reviewRequestsPerMonth: null,
    upcScansPerMonth: 5,
    upcSkusPerMonth: 60_000,
    purchaseOrderDiscrepancy: false,
    exports: false,
    historicalBuyBoxAverages: false,
  },
  plus: {
    monthlySales: null,
    marketplaces: 1,
    housedAsins: 2_000,
    brandSearchesPerMonth: 200,
    priorityOnboarding: false,
    prepCenterConnections: 2,
    authorizedUsers: 3,
    reviewRequestsPerMonth: null,
    upcScansPerMonth: null,
    upcSkusPerMonth: 300_000,
    purchaseOrderDiscrepancy: true,
    exports: true,
    historicalBuyBoxAverages: true,
  },
  pro: {
    monthlySales: null,
    marketplaces: 2,
    housedAsins: 4_000,
    brandSearchesPerMonth: null,
    priorityOnboarding: false,
    prepCenterConnections: 3,
    authorizedUsers: 5,
    reviewRequestsPerMonth: null,
    upcScansPerMonth: null,
    upcSkusPerMonth: null,
    purchaseOrderDiscrepancy: true,
    exports: true,
    historicalBuyBoxAverages: true,
  },
};

/** `Unlimited`, `60,000` — a limit as a pricing table should state it. */
export const limitLabel = (value: number | null): string =>
  value === null ? "Unlimited" : value.toLocaleString("en-US");

/** `$10K`, `Unlimited` — the sales ceiling as a pricing table should say it. */
export const salesCeilingLabel = (planId: Plan["id"]): string => {
  const ceiling = PLAN_LIMITS[planId].monthlySales;
  if (ceiling === null) return "Unlimited";
  return `Up to $${(ceiling / 1000).toFixed(0)}K/mo in revenue`;
};

/** `1,000 ASINs` — thousands separated, because these are counted figures. */
export const countLabel = (value: number, noun: string): string =>
  `${value.toLocaleString("en-US")} ${noun}`;
