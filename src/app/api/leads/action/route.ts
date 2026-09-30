import { NextRequest, NextResponse } from "next/server";
import { findLead } from "../../../../lib/leads/build";
import { addGhlTags, addGhlNote, GhlNotConfigured } from "../../../../lib/ghlLead";
import { auth } from "../../../../auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ActionBody {
  leadId: string;
  action: "contacted" | "note";
  note?: string;
  by?: string;
}

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

  const { leadId, action, note } = body;
  if (!leadId || (action !== "contacted" && action !== "note")) {
    return NextResponse.json({ error: "leadId and a valid action are required" }, { status: 400 });
  }
  if (action === "note" && !note?.trim()) {
    return NextResponse.json({ error: "note text is required for the note action" }, { status: 400 });
  }

  const session = await auth();
  const by = session?.user?.email || session?.user?.name || basicAuthUser(req) || body.by || "unknown";

  const lead = await findLead(leadId);
  if (!lead) {
    return NextResponse.json({ error: `Lead ${leadId} not found` }, { status: 404 });
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
