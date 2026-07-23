import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { lookupStripeCustomersByEmail } from "../../../../lib/dashboard/stripe";
import { getApexSignupEntries } from "../../../../lib/dashboard/signups";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Caps how many emails one call can enrich — keeps a single request fast
// (concurrency 5 in lookupStripeCustomersByEmail means ~100 emails is a few
// seconds) and prevents an accidental huge batch from one client call.
const MAX_EMAILS_PER_REQUEST = 100;

const bodySchema = z.object({
  emails: z.array(z.string().trim().email()).min(1).max(MAX_EMAILS_PER_REQUEST),
});

export interface PrimewellStripeStatusRow {
  isApexSubscriber: boolean;
  isPayingCustomer: boolean;
  customerSince: string | null;
  planName: string | null;
  ltv: number;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const { emails } = parsed.data;

  const [signupEntries, stripeStatusByEmail] = await Promise.all([
    getApexSignupEntries(),
    lookupStripeCustomersByEmail(emails),
  ]);

  const apexSignupEmails = new Set(signupEntries.entries.map((e) => e.email));

  const result: Record<string, PrimewellStripeStatusRow> = {};
  for (const email of emails) {
    const stripeStatus = stripeStatusByEmail.get(email);
    result[email] = {
      isApexSubscriber: apexSignupEmails.has(email),
      isPayingCustomer: stripeStatus?.isCustomer ?? false,
      customerSince: stripeStatus?.customerSince ?? null,
      planName: stripeStatus?.planName ?? null,
      ltv: stripeStatus?.ltv ?? 0,
    };
  }

  return NextResponse.json({ results: result, signupsConnected: signupEntries.connected });
}
