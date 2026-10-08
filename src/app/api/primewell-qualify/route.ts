import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GhlNotConfigured, addGhlTags, upsertGhlContact } from "../../../lib/ghlLead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Step 2 of the PrimeWell application on primewelldistribution.com (built in
 * Lovable, 2026-10-08). Step 1 is the embedded GHL form, which creates the
 * contact in PrimeWell's GHL location; step 2 asks two more questions and posts
 * the answers here, because the Lovable page cannot hold a GHL key.
 *
 * Answers land as custom fields `first_wholesale_po` and `moq_fit` plus tags,
 * on the PrimeWell contact and on the Apex CRM contact for the same email.
 * "15,000 and up" is the gold star (`hot-lead`), the PrimeWell twin of the
 * quiz's $10,000+ inventory budget.
 *
 * No secret, so a forged call is limited: it only ever updates a PrimeWell
 * contact with that exact email created in the last 24 hours, i.e. someone who
 * has just applied, and only with these two answers.
 */

const GHL = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
const FRESH_MS = 24 * 60 * 60 * 1000;

const MOQ = ["Under 2,000", "2,000-5,000", "5,000-15,000", "15,000 and up"] as const;
const MOQ_TAG: Record<(typeof MOQ)[number], string> = {
  "Under 2,000": "moq:under-2k",
  "2,000-5,000": "moq:2k-5k",
  "5,000-15,000": "moq:5k-15k",
  "15,000 and up": "moq:15k-plus",
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  firstPurchaseOrder: z.enum(["Yes", "No"]),
  moq: z.enum(MOQ),
});

const ALLOWED_ORIGIN = /^https:\/\/((www\.)?primewelldistribution\.com|[a-z0-9-]+\.lovable\.app|[a-z0-9-]+\.lovableproject\.com)$/;

function cors(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED_ORIGIN.test(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      }
    : { Vary: "Origin" };
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

async function pw(path: string, init: RequestInit = {}) {
  const token = process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN;
  if (!token) throw new GhlNotConfigured("PrimeWell GHL is not configured");
  return fetch(`${GHL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Version: VERSION, "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

/** The PrimeWell contact who just applied with this email, or null. */
async function freshPrimewellContact(email: string): Promise<{ id: string } | null> {
  const locationId = process.env.GHL_PRIMEWELL_LOCATION_ID;
  if (!locationId) throw new GhlNotConfigured("PrimeWell GHL is not configured");
  const res = await pw("/contacts/search", {
    method: "POST",
    body: JSON.stringify({ locationId, pageLimit: 10, query: email }),
  });
  if (!res.ok) throw new Error(`PrimeWell contact search failed: ${res.status}`);
  const { contacts = [] } = (await res.json()) as { contacts?: { id: string; email?: string; dateAdded?: string }[] };
  const match = contacts
    .filter((c) => c.email?.toLowerCase() === email && c.dateAdded && Date.now() - Date.parse(c.dateAdded) < FRESH_MS)
    .sort((a, b) => Date.parse(b.dateAdded!) - Date.parse(a.dateAdded!))[0];
  return match ? { id: match.id } : null;
}

export async function POST(req: NextRequest) {
  const headers = cors(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please answer both questions." }, { status: 400, headers });
  }
  const { email, firstPurchaseOrder, moq } = parsed.data;

  const fields = [
    { key: "first_wholesale_po", value: firstPurchaseOrder },
    { key: "moq_fit", value: moq },
  ];
  const tags = [`first-po:${firstPurchaseOrder.toLowerCase()}`, MOQ_TAG[moq], ...(moq === "15,000 and up" ? ["hot-lead"] : [])];

  try {
    // GHL's search can take several seconds to see a contact the form has just created.
    let applicant = await freshPrimewellContact(email);
    for (let attempt = 0; !applicant && attempt < 3; attempt++) {
      await new Promise((r) => setTimeout(r, 4000));
      applicant = await freshPrimewellContact(email);
    }
    // Same answer either way, so a caller learns nothing about who has applied.
    if (!applicant) return NextResponse.json({ ok: true }, { headers });

    const update = await pw(`/contacts/${applicant.id}`, {
      method: "PUT",
      body: JSON.stringify({ customFields: fields.map((f) => ({ key: f.key, field_value: f.value })) }),
    });
    if (!update.ok) throw new Error(`PrimeWell contact update failed: ${update.status}`);
    await addGhlTags(applicant.id, tags, "primewell");

    // The Apex CRM copy (the "Primewell 3" bridge creates or has created it by email).
    const apex = await upsertGhlContact({ email, source: "PrimeWell application", customFields: fields });
    await addGhlTags(apex.id, tags);

    return NextResponse.json({ ok: true }, { headers });
  } catch (err) {
    if (err instanceof GhlNotConfigured) {
      return NextResponse.json({ error: "Not available right now." }, { status: 503, headers });
    }
    console.error("primewell-qualify failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502, headers });
  }
}
