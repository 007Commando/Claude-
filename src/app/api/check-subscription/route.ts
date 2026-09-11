import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { lookupStripeCustomersByEmail } from "../../../lib/dashboard/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Mirrors the backend's entitlement policy: a trial is a subscriber, and a
// card mid-retry is not a cancellation.
const GRANTING = new Set(["active", "trialing", "past_due"]);

/**
 * Does this person have a subscription that grants access?
 *
 * Two matching paths, because either alone walls paying customers. The email
 * path catches customers whose Stripe customer carries their login email.
 * The accounts path catches everyone it misses: subscriptions created by the
 * app carry the account id in their metadata, and the caller reads the same
 * ids from the user's token claims -- an exact join that works when the
 * checkout email and login email are different strings, which for real
 * customers they routinely are.
 *
 * Public and unauthenticated by design -- it returns a single boolean.
 * Account ids are unguessable Firestore ids, and learning "this id has a
 * subscription" reveals nothing actionable.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const accounts = (req.nextUrl.searchParams.get("accounts") || "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id))
    .slice(0, 5);

  if (!email && !accounts.length) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    if (accounts.length) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (key) {
        const stripe = new Stripe(key, { maxNetworkRetries: 2 });
        for (const accountId of accounts) {
          const found = await stripe.subscriptions.search({
            query: `metadata["accountId"]:"${accountId}"`,
            limit: 20,
          });
          if (found.data.some((sub) => GRANTING.has(sub.status))) {
            return NextResponse.json({ hasActiveSubscription: true });
          }
        }
      }
    }

    if (email) {
      const result = await lookupStripeCustomersByEmail([email]);
      const lookup = result.get(email);
      if (lookup?.isActiveSubscriber) {
        return NextResponse.json({ hasActiveSubscription: true });
      }
    }

    return NextResponse.json({ hasActiveSubscription: false });
  } catch (err) {
    console.error("[check-subscription] lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}
