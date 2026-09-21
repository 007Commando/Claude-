import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApexMembers } from "../../../../lib/dashboard/apex";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Kept for the table's per-page enrichment path, now answered by Apex itself
// rather than a Stripe lookup per email. The summary already checks every
// row, so this only runs when a row somehow arrives unchecked.
const MAX_EMAILS_PER_REQUEST = 500;

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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { emails } = parsed.data;
  const apex = await getApexMembers(emails);

  const result: Record<string, PrimewellStripeStatusRow> = {};
  for (const email of emails) {
    const member = apex.members[email.toLowerCase()];
    result[email] = {
      isApexSubscriber: Boolean(member),
      isPayingCustomer: Boolean(member?.hasAccess) && member?.subscription?.status !== "trialing",
      customerSince: member?.subscription?.since ?? null,
      planName: member?.subscription?.plan ?? null,
      ltv: 0,
    };
  }

  return NextResponse.json({ results: result, signupsConnected: apex.connected });
}
