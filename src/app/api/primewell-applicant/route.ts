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
 * Called by "Primewell 3: Send applicant to Apex", a workflow in the PrimeWell
 * GoHighLevel location, each time somebody applies to PrimeWell. It copies the
 * applicant into Apex's own GHL location tagged `primewell-applicant`, and that
 * tag starts the Apex SMS and email sequence for PrimeWell applicants there.
 *
 * No shared secret: GHL's webhook action cannot set headers, and a secret in
 * the URL would sit in plain sight in the workflow. Instead the only thing
 * taken from the request is the PrimeWell contact id, and the contact itself
 * is read back from the PrimeWell location with its own token. A forged call
 * can therefore do no more than copy a genuine PrimeWell applicant across,
 * which is what the endpoint is for anyway.
 *
 * Applicants who already have an Apex account, or who came through the
 * /primewell sign-up form (tag `primewell-lead`), are copied across but not
 * tagged: the sequence exists to get them into an account they already have.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const APPLICANT_TAG = "primewell-applicant";
const ALREADY_IN = [
  "primewell-lead",
  "stage:registered",
  "stage:trial",
  "stage:activated",
  "stage:amazon-connected",
  "stage:customer",
];

interface PrimewellContact {
  id: string;
  locationId?: string;
  firstName?: string;
  lastName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

async function readPrimewellContact(contactId: string): Promise<PrimewellContact | null> {
  const token = process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_PRIMEWELL_LOCATION_ID;
  if (!token || !locationId) throw new GhlNotConfigured("PrimeWell GHL is not configured");
  const res = await fetch(`${GHL_BASE_URL}/contacts/${encodeURIComponent(contactId)}`, {
    headers: { Authorization: `Bearer ${token}`, Version: GHL_VERSION, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 400 || res.status === 404 || res.status === 422) return null;
  if (!res.ok) throw new Error(`PrimeWell contact lookup failed: ${res.status}`);
  const { contact } = (await res.json()) as { contact?: PrimewellContact };
  return contact && contact.locationId === locationId ? contact : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const contactId = typeof body.contact_id === "string" ? body.contact_id.trim() : "";
  if (!/^[A-Za-z0-9]{10,40}$/.test(contactId)) {
    return NextResponse.json({ error: "contact_id required" }, { status: 400 });
  }

  try {
    const applicant = await readPrimewellContact(contactId);
    if (!applicant) {
      return NextResponse.json({ error: "Not a PrimeWell contact" }, { status: 404 });
    }

    const email = applicant.email?.trim().toLowerCase() || undefined;
    const phone = normalisePhone(applicant.phone);
    if (!email && !phone) {
      // GHL records a stalled form as a contact with no fields; nothing to send.
      return NextResponse.json({ ok: true, skipped: "no email or phone" });
    }

    const contact = await upsertGhlContact({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      name: applicant.contactName,
      email,
      phone,
      source: "PrimeWell application",
    });

    const alreadyIn = contact.tags.find((tag) => ALREADY_IN.includes(tag));
    if (alreadyIn) {
      return NextResponse.json({ ok: true, contactId: contact.id, skipped: alreadyIn });
    }

    await addGhlTags(contact.id, [APPLICANT_TAG]);
    await addGhlNote(
      contact.id,
      `Applied to PrimeWell (PrimeWell contact ${contactId}). Copied here by the "Primewell 3: Send applicant to Apex" workflow.`,
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
