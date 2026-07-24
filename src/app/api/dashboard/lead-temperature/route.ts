import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLeadEngagement } from "../../../../lib/dashboard/ghlEngagement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Caps how many contacts one call can enrich — keeps a single request fast
// and prevents an accidental huge batch from one client call (same pattern
// as /api/dashboard/primewell-stripe-status).
const MAX_CONTACTS_PER_REQUEST = 100;

const bodySchema = z.object({
  source: z.enum(["primewell", "ash", "facebook"]),
  contactIds: z.array(z.string().trim().min(1)).min(1).max(MAX_CONTACTS_PER_REQUEST),
});

function credentialsFor(source: "primewell" | "ash" | "facebook"): { token?: string; locationId?: string } {
  if (source === "primewell") {
    return {
      token: process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN,
      locationId: process.env.GHL_PRIMEWELL_LOCATION_ID,
    };
  }
  if (source === "ash") {
    return {
      token: process.env.GHL_ASH_PRIVATE_INTEGRATION_TOKEN,
      locationId: process.env.GHL_ASH_LOCATION_ID,
    };
  }
  return {
    token: process.env.GHL_PRIVATE_INTEGRATION_TOKEN,
    locationId: process.env.GHL_LOCATION_ID,
  };
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

  const { source, contactIds } = parsed.data;
  const { token, locationId } = credentialsFor(source);

  if (!token || !locationId) {
    return NextResponse.json({ error: `GHL credentials for "${source}" are not configured` }, { status: 503 });
  }

  const engagementByContact = await getLeadEngagement(contactIds, token, locationId);

  const results: Record<string, { temperature: string; lastMessageAt: string | null; hasReplied: boolean }> = {};
  for (const contactId of contactIds) {
    const engagement = engagementByContact.get(contactId);
    results[contactId] = {
      temperature: engagement?.temperature ?? "cold",
      lastMessageAt: engagement?.lastMessageAt ?? null,
      hasReplied: engagement?.hasReplied ?? false,
    };
  }

  return NextResponse.json({ results });
}
