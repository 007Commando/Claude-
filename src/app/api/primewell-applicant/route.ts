import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
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
 * Called by a workflow in the PrimeWell GoHighLevel location each time
 * somebody applies to PrimeWell. It copies the applicant into Apex's own GHL
 * location tagged `primewell-applicant`, and that tag starts the Apex SMS and
 * email sequence for PrimeWell applicants there.
 *
 * Applicants who already have an Apex account, or who came through the
 * /primewell sign-up form (tag `primewell-lead`), are copied across but not
 * tagged: the sequence exists to get them into an account they already have.
 *
 * GHL's webhook action cannot set headers, so the shared secret travels as
 * `?key=` (PRIMEWELL_WEBHOOK_SECRET). The body is GHL's standard webhook
 * payload: first_name, last_name, full_name, email, phone and friends.
 */

const APPLICANT_TAG = "primewell-applicant";
const ALREADY_IN = [
  "primewell-lead",
  "stage:registered",
  "stage:trial",
  "stage:activated",
  "stage:amazon-connected",
  "stage:customer",
];

function keyMatches(given: string | null): boolean {
  const expected = process.env.PRIMEWELL_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(req: NextRequest) {
  if (!keyMatches(req.nextUrl.searchParams.get("key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = str(body.email)?.toLowerCase();
  const phone = normalisePhone(str(body.phone));
  if (!email && !phone) {
    // GHL records a stalled form as a contact with no fields; nothing to send.
    return NextResponse.json({ ok: true, skipped: "no email or phone" });
  }

  try {
    const contact = await upsertGhlContact({
      firstName: str(body.first_name),
      lastName: str(body.last_name),
      name: str(body.full_name),
      email,
      phone,
      source: "PrimeWell application",
    });

    const alreadyIn = contact.tags.find((tag) => ALREADY_IN.includes(tag));
    if (alreadyIn) {
      return NextResponse.json({ ok: true, contactId: contact.id, skipped: alreadyIn });
    }

    await addGhlTags(contact.id, [APPLICANT_TAG]);
    const primewellId = str(body.contact_id);
    await addGhlNote(
      contact.id,
      `Applied to PrimeWell${primewellId ? ` (PrimeWell contact ${primewellId})` : ""}. Copied here by the PrimeWell application workflow.`,
    );
    return NextResponse.json({ ok: true, contactId: contact.id });
  } catch (err) {
    if (err instanceof GhlNotConfigured) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }
    console.error("primewell-applicant failed", err);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
