import { NextRequest, NextResponse } from "next/server";
import { addGhlTags } from "../../../lib/ghlLead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The WhatsApp community link in our emails, tracked: /api/wa?c=<GHL contact
 * id> tags the contact `whatsapp-clicked` in Apex's GHL location and sends
 * them on to the group. The raw chat.whatsapp.com link tells us nothing, so
 * this is how a later reminder can skip the people who already clicked
 * (Stefano, 2026-10-09). A missing or malformed id still redirects; tagging
 * never blocks the click.
 */
const GROUP_URL = "https://chat.whatsapp.com/KcqPska2mPQAdgJXTP2TVX";
const CONTACT_ID = /^[A-Za-z0-9]{10,40}$/;

export async function GET(req: NextRequest) {
  const contactId = req.nextUrl.searchParams.get("c") ?? "";
  if (CONTACT_ID.test(contactId)) {
    await addGhlTags(contactId, ["whatsapp-clicked"]).catch((err) => console.warn("WhatsApp click tag failed", err));
  }
  return NextResponse.redirect(GROUP_URL, 302);
}
