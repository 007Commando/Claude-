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
 * The website arm of the Apex Pop A/B.
 *
 * The Facebook instant form asks four questions and GHL maps them onto four
 * custom fields. This route takes the same four answers from the website
 * qualifier (/apex-pop/start) and writes them onto the same fields, so a lead
 * from either arm looks identical in GHL except for one tag: `pop-web-lead`
 * here, `pop-facebook-lead` from the form's workflow. That tag is the split;
 * everything downstream (the demo follow-up, the starter-kit branch) keys
 * off the branch tags both arms set.
 */
const SELLS = ["Yes", "No"] as const;
const OBSTACLE_SELLER = [
  "Find profitable products",
  "Find more suppliers",
  "Scale operations",
  "I don't know",
] as const;
const OBSTACLE_NEW = [
  "Getting started",
  "Knowing the right steps",
  "I have less than $1,000 for inventory",
] as const;
const TIMING = ["Today", "Tomorrow", "Next week"] as const;

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  sellsOnAmazon: z.enum(SELLS),
  obstacle: z.enum([...OBSTACLE_SELLER, ...OBSTACLE_NEW]),
  demoTiming: z.enum(TIMING).optional(),
  from: z.string().trim().max(80).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
});

export const STARTER_KIT_ANSWER = "I have less than $1,000 for inventory";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }
  const lead = parsed.data;
  const phone = normalisePhone(lead.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a phone number with area code." }, { status: 400 });
  }

  const starterKit = lead.obstacle === STARTER_KIT_ANSWER;
  const [firstName, ...rest] = lead.name.split(/\s+/);
  const isSeller = lead.sellsOnAmazon === "Yes";

  try {
    const contact = await upsertGhlContact({
      firstName,
      lastName: rest.join(" ") || undefined,
      name: lead.name,
      email: lead.email.toLowerCase(),
      phone,
      source: "apex-pop-web",
      customFields: [
        { key: "sells_on_amazon", value: lead.sellsOnAmazon },
        { key: isSeller ? "biggest_obstacle_seller" : "biggest_obstacle_new", value: lead.obstacle },
        ...(lead.demoTiming ? [{ key: "demo_timing", value: lead.demoTiming }] : []),
      ],
    });
    await addGhlTags(contact.id, ["pop-web-lead", starterKit ? "pop-starter-kit" : "pop-demo-lead"]);
    await addGhlNote(
      contact.id,
      [
        `Apex Pop website qualifier (${lead.from ?? "apex-pop"})`,
        `Sells on Amazon: ${lead.sellsOnAmazon}`,
        `Biggest obstacle: ${lead.obstacle}`,
        lead.demoTiming ? `Demo timing: ${lead.demoTiming}` : null,
        lead.utmCampaign ? `Campaign: ${lead.utmSource ?? ""}/${lead.utmMedium ?? ""}/${lead.utmCampaign}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (err) {
    if (err instanceof GhlNotConfigured) {
      return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
    }
    console.error("pop-qualify: GHL write failed", err);
    return NextResponse.json({ error: "We could not save your answers. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ next: starterKit ? "starter-kit" : "signup" });
}
