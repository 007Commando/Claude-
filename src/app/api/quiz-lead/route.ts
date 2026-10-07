import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GhlNotConfigured, addGhlNote, addGhlTags, normalisePhone, upsertGhlContact, utmCustomFields } from "../../../lib/ghlLead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The /apex-quiz funnel's one write: the five answers, the result they led
 * to, and who the visitor is. GHL gets the contact (phone optional here,
 * unlike the Pop qualifier: the quiz trades the result for an email), the
 * journey tags the nurtures already branch on, `quiz-lead` and
 * `quiz:<result>`, and a note with every answer so a human calling has the
 * whole picture.
 */
const RESULTS = ["starter", "arbitrage", "spreadsheet", "scaler"] as const;

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  result: z.enum(RESULTS),
  /** Whether they sell on Amazon yet, from the first question. */
  selling: z.boolean(),
  answers: z.record(z.string().max(60), z.string().max(120)),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your name and email and try again." }, { status: 400 });
  }
  const lead = parsed.data;
  const phone = lead.phone ? normalisePhone(lead.phone) : null;
  const [firstName, ...rest] = lead.name.split(/\s+/);
  const selling = lead.selling;

  try {
    const contact = await upsertGhlContact({
      firstName,
      lastName: rest.join(" ") || undefined,
      name: lead.name,
      email: lead.email.toLowerCase(),
      phone,
      source: "apex-quiz",
      customFields: [{ key: "sells_on_amazon", value: selling ? "Yes" : "No" }, ...utmCustomFields(lead)],
    });
    await addGhlTags(contact.id, [
      "quiz-lead",
      `quiz:${lead.result}`,
      ...(selling ? ["sells on amazon", "already-selling"] : ["just-getting-started"]),
    ]);
    await addGhlNote(
      contact.id,
      [
        `Apex seller quiz: result "${lead.result}"`,
        ...Object.entries(lead.answers).map(([q, a]) => `${q}: ${a}`),
        lead.utmCampaign ? `Campaign: ${lead.utmSource ?? ""}/${lead.utmMedium ?? ""}/${lead.utmCampaign}` : null,
        lead.utmContent ? `Ad: ${lead.utmContent}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (err) {
    if (err instanceof GhlNotConfigured) {
      return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
    }
    console.error("quiz-lead: GHL write failed", err);
    return NextResponse.json({ error: "We could not save your result. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
