import { NextRequest, NextResponse } from "next/server";
import { lookupStripeCustomersByEmail } from "../../../lib/dashboard/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public, unauthenticated endpoint by design — it's called from the client
// right after login/signup, before the user has any session with this app
// itself (auth lives entirely in the external ApexAuth service). It only
// ever returns a single boolean, never customer details, so there's nothing
// sensitive to protect beyond normal rate-limit hygiene.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const result = await lookupStripeCustomersByEmail([email]);
    const lookup = result.get(email);
    return NextResponse.json({ hasActiveSubscription: Boolean(lookup?.isActiveSubscriber) });
  } catch (err) {
    console.error("[check-subscription] lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}
