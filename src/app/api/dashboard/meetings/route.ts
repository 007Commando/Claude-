import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getBookedMeetings,
  isCalendlyConfigured,
  type BookedMeeting,
} from "../../../../lib/dashboard/calendly";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Matches the cap on the other enrichment endpoints, so one screen of leads is
// one call and nothing can ask for an unbounded batch.
const MAX_EMAILS_PER_REQUEST = 200;

const bodySchema = z.object({
  emails: z
    .array(z.string().trim().min(1))
    .min(1)
    .max(MAX_EMAILS_PER_REQUEST),
});

export async function POST(req: NextRequest) {
  if (!isCalendlyConfigured()) {
    // Distinguished from "nobody has booked": the column can then say it is
    // not connected rather than quietly implying an empty calendar.
    return NextResponse.json(
      { configured: false, meetings: {} },
      { status: 200 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const booked = await getBookedMeetings();
    const meetings: Record<string, BookedMeeting | null> = {};

    for (const raw of parsed.data.emails) {
      const email = raw.trim().toLowerCase();
      meetings[raw] = booked.get(email) ?? null;
    }

    return NextResponse.json({ configured: true, meetings });
  } catch (error) {
    console.error("Calendly lookup failed", error);
    // A calendar outage must not take the leads table down with it.
    return NextResponse.json(
      { configured: true, meetings: {}, error: "Calendly lookup failed" },
      { status: 200 },
    );
  }
}
