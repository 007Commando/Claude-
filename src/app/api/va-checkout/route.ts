import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { computeVaQuote } from "../../../lib/vaPricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  vaName: z.string().trim().min(1),
  startHour: z.number().int(),
  endHour: z.number().int(),
  quarterly: z.boolean()
});

/**
 * Creates a Stripe Checkout session for a VA schedule.
 *
 * The client sends its schedule choices and nothing else; the price is
 * recomputed here from vaPricing, so the amount charged is decided by the
 * same module that rendered the quote — a tampered request can change what
 * hours are bought, never what an hour costs.
 */
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Checkout is not configured" }, { status: 500 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = computeVaQuote(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { quote } = result;

  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const stripe = new Stripe(key, { maxNetworkRetries: 2 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: quote.chargeCents,
            recurring: body.quarterly ? { interval: "month", interval_count: 3 } : { interval: "month" },
            product_data: {
              name: `Apex VA — ${quote.va.name}, ${quote.weeklyHours} hrs/week`,
              description: `${quote.scheduleLabel}. Billed ${body.quarterly ? "quarterly (5% off)" : "monthly"}; includes 4% service & processing.`
            }
          }
        }
      ],
      subscription_data: {
        metadata: {
          service: "apex-va",
          va: quote.va.name,
          schedule: quote.scheduleLabel,
          weekly_hours: String(quote.weeklyHours),
          billing: body.quarterly ? "quarterly" : "monthly"
        }
      },
      metadata: { service: "apex-va" },
      success_url: `${origin}/apex-vas?checkout=success`,
      cancel_url: `${origin}/apex-vas?checkout=cancelled`
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const detail = err instanceof Stripe.errors.StripeError ? err.message : "Checkout failed";
    // Permission and config problems are ours, not the customer's.
    console.error("va-checkout failed:", detail);
    return NextResponse.json({ error: "Checkout could not be started. Please try again or email support." }, { status: 502 });
  }
}
