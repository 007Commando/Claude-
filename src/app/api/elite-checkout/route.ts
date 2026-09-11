import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Apex Elite's checkout: $297 charged today, then $149.99/month starting
 * automatically on day 91.
 *
 * One Stripe subscription expresses the whole offer -- a 90-day trial on the
 * monthly price with the $297 one-time item on the first invoice -- so the
 * continuation needs no cron, no manual follow-up, and no second product. The
 * metadata (plan: starter) is what lets the backend's entitlement webhook
 * grant software access from day one: `trialing` is a granting status.
 *
 * Live price ids under product prod_VF29IR41sVrdWX ("Apex Elite"):
 */
const ELITE_ONE_TIME_PRICE = "price_1UEY5F09vRtiSO1RQ6N9qjuf"; // $297 once
const ELITE_MONTHLY_PRICE = "price_1UEY5F09vRtiSO1R0kR4ExoC"; // $149.99/mo after trial
const TRIAL_DAYS = 90;

export async function GET(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  const origin = req.nextUrl.origin.includes("localhost")
    ? req.nextUrl.origin
    : "https://www.apexapplications.io";
  const stripe = new Stripe(key, { maxNetworkRetries: 2 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: ELITE_ONE_TIME_PRICE, quantity: 1 },
        { price: ELITE_MONTHLY_PRICE, quantity: 1 }
      ],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { plan: "starter", period: "monthly", service: "apex-elite" }
      },
      metadata: { service: "apex-elite" },
      allow_promotion_codes: false,
      success_url: `${origin}/apex-elite?checkout=success`,
      cancel_url: `${origin}/apex-elite`
    });
    if (!session.url) throw new Error("no session url");
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("elite-checkout failed:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${origin}/apex-elite?checkout=error`, 303);
  }
}
