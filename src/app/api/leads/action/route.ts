import { NextRequest, NextResponse } from "next/server";
import { findLead } from "../../../../lib/leads/build";
import {
  addGhlTags,
  addGhlNote,
  removeGhlContactTags,
  sendGhlEmail,
  upsertGhlContact,
  GhlNotConfigured,
} from "../../../../lib/ghlLead";
import { offerEmail } from "../../../../lib/leads/offerEmail";
import { auth } from "../../../../auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ActionBody {
  leadId: string;
  action: "contacted" | "note" | "grade" | "send-offer";
  note?: string;
  /** send-offer: the opening line the rep edited in the preview. */
  intro?: string;
  grade?: "A" | "B" | "C" | null;
  by?: string;
}

const GRADE_TAGS = ["grade:a", "grade:b", "grade:c"];

function todayInNewYork(): string {
  // en-CA formats as YYYY-MM-DD, which is exactly the outreach:YYYY-MM-DD tag format.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

/** Username from a Basic Authorization header, for the pre-Google fallback gate. */
function basicAuthUser(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
    const i = decoded.indexOf(":");
    return i > 0 ? decoded.slice(0, i) : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: ActionBody;
  try {
    body = (await req.json()) as ActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { leadId, action, note, grade } = body;
  if (!leadId || !["contacted", "note", "grade", "send-offer"].includes(action)) {
    return NextResponse.json({ error: "leadId and a valid action are required" }, { status: 400 });
  }
  if (action === "note" && !note?.trim()) {
    return NextResponse.json({ error: "note text is required for the note action" }, { status: 400 });
  }

  if (action === "grade" && grade !== null && grade !== "A" && grade !== "B" && grade !== "C") {
    return NextResponse.json({ error: "grade must be A, B, C or null for the grade action" }, { status: 400 });
  }

  const session = await auth();
  const by = session?.user?.email || session?.user?.name || basicAuthUser(req) || body.by || "unknown";

  const lead = await findLead(leadId);
  if (!lead) {
    return NextResponse.json({ error: `Lead ${leadId} not found` }, { status: 404 });
  }

  /**
   * The rep's one-click email: the $1 week offer and Stefano's booking link,
   * sent through the Apex GHL location so it lands in the contact's
   * conversation like any other email and replies come back there. A lead
   * whose only contact is in PrimeWell's location, or who has an Apex account
   * but no contact at all, gets an Apex contact first (by email; an upsert,
   * so nothing existing is overwritten).
   */
  if (action === "send-offer") {
    if (!lead.email) {
      return NextResponse.json({ error: "This lead has no email address" }, { status: 409 });
    }
    const repName = session?.user?.name || by.split("@")[0];
    const repFirst = repName.trim().split(/\s+/)[0] || "Apex";
    const today = todayInNewYork();
    try {
      const contactId =
        lead.ghlLocation === "apex" && lead.ghlContactId
          ? lead.ghlContactId
          : (await upsertGhlContact({ email: lead.email, name: lead.name, source: "Lead Desk offer email" })).id;
      const email = offerEmail({ firstName: lead.name.includes("@") ? "" : lead.name, repName, intro: body.intro, note });
      await sendGhlEmail(contactId, { ...email, emailFrom: `${repFirst} at Apex <info@apexapplications.io>` });
      await addGhlTags(contactId, [`offer-sent:${today}`, `outreach:${today}`]);
      await addGhlNote(contactId, `$1 week offer email sent by ${by} on ${today}`);
      return NextResponse.json({ ok: true, sentAt: new Date().toISOString(), outreachDate: today });
    } catch (err) {
      if (err instanceof GhlNotConfigured) {
        return NextResponse.json({ error: "GHL is not configured" }, { status: 503 });
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to send the email" },
        { status: 502 },
      );
    }
  }
  if (!lead.ghlContactId || !lead.ghlLocation) {
    return NextResponse.json(
      { error: "This lead exists only as an Apex account with no GHL contact — nothing to write back to." },
      { status: 409 },
    );
  }

  const today = todayInNewYork();

  try {
    if (action === "contacted") {
      await addGhlTags(lead.ghlContactId, [`outreach:${today}`], lead.ghlLocation);
      const noteBody = note?.trim()
        ? `Outreach by ${by} on ${today}: ${note.trim()}`
        : `Outreach by ${by} on ${today}`;
      await addGhlNote(lead.ghlContactId, noteBody, lead.ghlLocation);
      return NextResponse.json({ ok: true, outreachDate: today });
    }

    if (action === "grade") {
      // Take the other grades off first so a failure never leaves two on the contact.
      const stale = GRADE_TAGS.filter((t) => t !== (grade ? `grade:${grade.toLowerCase()}` : ""));
      // A refusal here (tags the contact never had) must not block the new
      // grade; the drawer reads the best grade if two ever coexist.
      await removeGhlContactTags(lead.ghlContactId, stale, lead.ghlLocation).catch((err) =>
        console.warn("Lead Desk grade: removing old grade tags failed", err),
      );
      if (grade) {
        await addGhlTags(lead.ghlContactId, [`grade:${grade.toLowerCase()}`], lead.ghlLocation);
      }
      await addGhlNote(
        lead.ghlContactId,
        grade ? `Graded ${grade} by ${by} on ${today}` : `Grade cleared by ${by} on ${today}`,
        lead.ghlLocation,
      );
      return NextResponse.json({ ok: true, grade: grade ?? null });
    }

    // action === "note"
    await addGhlNote(lead.ghlContactId, `Note by ${by} on ${today}: ${note!.trim()}`, lead.ghlLocation);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof GhlNotConfigured) {
      return NextResponse.json({ error: "GHL is not configured for this lead's location" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to write back to GHL" },
      { status: 502 },
    );
  }
}
