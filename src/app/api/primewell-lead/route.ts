import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  GhlNotConfigured,
  addGhlNote,
  addGhlTags,
  normalisePhone,
  upsertGhlContact,
} from "../../../lib/ghlLead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The /primewell form. Puts a PrimeWell applicant into Apex's own
 * GoHighLevel location (GHL_LOCATION_ID, the same one the Facebook leads land
 * in) and tags them `primewell-lead`. That tag is what starts the PrimeWell
 * SMS and email sequence in GHL, so the tag, not the form, is the contract.
 */

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

export async function POST(req: NextRequest) {
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
  let contactId: string;
  try {
    const contact = await upsertGhlContact({
      firstName,
      lastName: rest.join(" ") || undefined,
      name: lead.name,
      email: lead.email,
      phone,
      source: "PrimeWell landing page",
    });
    contactId = contact.id;
    await addGhlTags(contactId, [LEAD_TAG]);
  } catch (err) {
    if (err instanceof GhlNotConfigured) {
      return NextResponse.json({ error: "The form is not available right now." }, { status: 503 });
    }
    console.error("primewell-lead failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  // Where they came from, as a note on the contact. Best effort only.
  await addGhlNote(
    contactId,
    [
      `Came in through ${lead.pageUrl ?? "/primewell"}`,
      lead.utmSource && `utm_source=${lead.utmSource}`,
      lead.utmMedium && `utm_medium=${lead.utmMedium}`,
      lead.utmCampaign && `utm_campaign=${lead.utmCampaign}`,
    ]
      .filter(Boolean)
      .join(" · "),
  );

  return NextResponse.json({ ok: true, eventId: `pw-${contactId}` });
}
