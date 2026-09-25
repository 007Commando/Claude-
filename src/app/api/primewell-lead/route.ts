import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The /primewell form. Puts a PrimeWell applicant into Apex's own
 * GoHighLevel location (GHL_LOCATION_ID, the same one the Facebook leads land
 * in) and tags them `primewell-lead`. That tag is what starts the PrimeWell
 * SMS and email sequence in GHL, so the tag, not the form, is the contract.
 *
 * Upsert first, then add the tag in its own call: GHL's upsert replaces the
 * contact's tag list with whatever it is given, which would strip an
 * applicant who is already a contact of the tags they carry.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const LEAD_TAG = "primewell-lead";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email.").max(255),
  phone: z.string().trim().min(7, "Please enter your mobile number.").max(30),
  company: z.string().max(200).optional(),
  elapsedMs: z.number().optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  pageUrl: z.string().trim().max(2048).optional(),
});

/** US numbers typed without a country code are the common case here. */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.length >= 9 ? digits : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// A light per-instance brake on repeat submissions from one address. Not a
// real rate limiter (instances do not share it), just enough to stop a
// refresh loop or a naive script from writing hundreds of contacts.
const recent = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

async function ghl(path: string, token: string, init: RequestInit): Promise<Response> {
  return fetch(`${GHL_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

export async function POST(req: NextRequest) {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    return NextResponse.json({ error: "The form is not available right now." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your details." },
      { status: 400 },
    );
  }
  const lead = parsed.data;

  // Bots: a filled honeypot or a submit faster than a person can type.
  // Answer as if it worked so they learn nothing.
  if (lead.company || (lead.elapsedMs !== undefined && lead.elapsedMs < 2500)) {
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const phone = normalisePhone(lead.phone);
  if (!phone) {
    return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
  }

  const [firstName, ...rest] = lead.name.split(/\s+/);
  const upsert = await ghl("/contacts/upsert", token, {
    method: "POST",
    body: JSON.stringify({
      locationId,
      firstName,
      lastName: rest.join(" ") || undefined,
      name: lead.name,
      email: lead.email,
      phone,
      source: "PrimeWell landing page",
    }),
  });
  if (!upsert.ok) {
    const detail = await upsert.text().catch(() => "");
    console.error("primewell-lead upsert failed", upsert.status, detail.slice(0, 300));
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }
  const { contact } = (await upsert.json()) as { contact?: { id?: string } };
  if (!contact?.id) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  const tagged = await ghl(`/contacts/${contact.id}/tags`, token, {
    method: "POST",
    body: JSON.stringify({ tags: [LEAD_TAG] }),
  });
  if (!tagged.ok) {
    const detail = await tagged.text().catch(() => "");
    console.error("primewell-lead tag failed", tagged.status, detail.slice(0, 300));
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  // Where they came from, as a note on the contact. Best effort only.
  const origin = [
    `Came in through ${lead.pageUrl ?? "/primewell"}`,
    lead.utmSource && `utm_source=${lead.utmSource}`,
    lead.utmMedium && `utm_medium=${lead.utmMedium}`,
    lead.utmCampaign && `utm_campaign=${lead.utmCampaign}`,
  ]
    .filter(Boolean)
    .join(" · ");
  await ghl(`/contacts/${contact.id}/notes`, token, {
    method: "POST",
    body: JSON.stringify({ body: origin }),
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, eventId: `pw-${contact.id}` });
}
