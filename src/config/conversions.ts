/**
 * The conversions this site reports to Google Ads.
 *
 * Google identifies a conversion action as `AW-XXXXXXXXX/labelGoesHere`, and
 * the label half is minted when the action is created in the Google Ads
 * interface. It cannot be known in advance and it is not a secret, so each one
 * is an environment variable and every call site is written as though the
 * label exists. Where it does not, the call is a no-op.
 *
 * That is the whole design goal: the tracking ships before the Google Ads
 * account does, and turning it on is pasting variables into Vercel rather than
 * a deploy under time pressure on the day a campaign is due to launch.
 *
 *   NEXT_PUBLIC_GADS_LABEL_TRIAL
 *   NEXT_PUBLIC_GADS_LABEL_FREE_ACCOUNT
 *   NEXT_PUBLIC_GADS_LABEL_CHECKOUT
 *   NEXT_PUBLIC_GADS_LABEL_BOOKING
 *
 * The values below are what a conversion is worth to the bid strategy, not
 * what anything costs. They are deliberately ordered rather than precise: a
 * trial start is worth many times a page of interest, and Smart Bidding needs
 * to know the ratio far more than it needs the absolute number. $250 on a
 * trial is roughly Starter at $149 against an assumed trial-to-paid rate, and
 * it is written down here so the assumption can be argued with instead of
 * being buried in a bid strategy.
 */

export type ConversionName = "trial" | "freeAccount" | "checkout" | "booking";

interface ConversionSpec {
  label: string | undefined;
  /** Value passed to Google, in USD. */
  value: number;
  /** What this is called in Google Ads, so the two can be matched up. */
  action: string;
}

export const CONVERSIONS: Record<ConversionName, ConversionSpec> = {
  trial: {
    label: process.env.NEXT_PUBLIC_GADS_LABEL_TRIAL,
    value: 250,
    action: "Trial Started",
  },
  freeAccount: {
    label: process.env.NEXT_PUBLIC_GADS_LABEL_FREE_ACCOUNT,
    value: 15,
    action: "Free Account Created",
  },
  checkout: {
    label: process.env.NEXT_PUBLIC_GADS_LABEL_CHECKOUT,
    value: 25,
    action: "Checkout Started",
  },
  booking: {
    label: process.env.NEXT_PUBLIC_GADS_LABEL_BOOKING,
    value: 40,
    action: "Booking Started",
  },
};
