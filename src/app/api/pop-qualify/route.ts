import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GhlNotConfigured, addGhlNote, addGhlTags, normalisePhone, removeGhlTags, upsertGhlContact, utmCustomFields } from "../../../lib/ghlLead";
import { HOT_BUDGETS, QUIZ_QUESTIONS } from "../../../lib/quizQuestions";

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
  "Going brand direct",
  "Scale operations",
] as const;
const OBSTACLE_NEW = [
  "Getting started",
  "Knowing the right steps",
  "I have less than $1,000 for inventory",
] as const;
const TIMING = ["Today", "Tomorrow", "Next week"] as const;

/**
 * How much they could put into inventory (Stefano, 2026-10-08): the seller
 * quiz's five answers, asked on every inflow so a $10,000+ lead earns the gold
 * star wherever they came in. Stored as the answer's words in the
 * `inventory_budget` field, which the Facebook instant forms fill too.
 */
const BUDGETS = QUIZ_QUESTIONS.budget.options.map((o) => o.slug) as [string, ...string[]];
const budgetLabel = (slug: string) => QUIZ_QUESTIONS.budget.options.find((o) => o.slug === slug)?.label ?? slug;
const BUDGET_TAGS = BUDGETS.map((b) => `budget:${b}`);
function budgetTags(slug: string) {
  return [`budget:${slug}`, ...(HOT_BUDGETS.includes(slug) ? ["hot-lead"] : [])];
}

/**
 * Two stages, because the page asks for details first (the PrimeWell
 * application's order): "details" lands the contact the moment they are
 * typed, tagged `pop-web-started`, so a lead who leaves at question two is
 * still a lead; "complete" adds the answers and the branch tag that starts
 * the follow-up. Same email both times, so it is one contact.
 */
const schema = z.object({
  stage: z.enum(["details", "journey", "obstacle", "budget", "complete"]).default("complete"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  sellsOnAmazon: z.enum(SELLS).optional(),
  obstacle: z.enum([...OBSTACLE_SELLER, ...OBSTACLE_NEW]).optional(),
  demoTiming: z.enum(TIMING).optional(),
  budget: z.enum(BUDGETS).optional(),
  from: z.string().trim().max(80).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  /** The ad and ad set on a Meta click (utm_content / utm_term). */
  utmContent: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
  /** "dollar-week" when step 3 sold the $1 week; tags pop-dollar-week. */
  offer: z.enum(["dollar-week"]).optional(),
});

export const STARTER_KIT_ANSWER = "I have less than $1,000 for inventory";

/**
 * The tags that say which side of the line a lead is on, so the nurtures
 * already in place can pick them up by tag as well as by the field. "sells
 * on amazon" is the tag Stefano asked for by name; "already-selling" and
 * "just-getting-started" are the pair the August lead import was sorted
 * into, so a seller from this form lands in the same bucket as those.
 */
function journeyTags(sellsOnAmazon: "Yes" | "No") {
  return sellsOnAmazon === "Yes" ? ["sells on amazon", "already-selling"] : ["just-getting-started"];
}

/**
 * One tag per obstacle, so a seller who said "Going brand direct" can get an
 * SMS or email about brand direct and nothing else. New-seller answers get
 * the same treatment; it costs nothing and keeps the smart lists symmetrical.
 */
const OBSTACLE_TAGS: Record<string, string> = {
  "Find profitable products": "obstacle:profitable-products",
  "Find more suppliers": "obstacle:more-suppliers",
  "Going brand direct": "obstacle:brand-direct",
  "Scale operations": "obstacle:scale-operations",
  "Getting started": "obstacle:getting-started",
  "Knowing the right steps": "obstacle:right-steps",
  "I have less than $1,000 for inventory": "obstacle:under-1000",
};

/** Swap the obstacle tag: take every other obstacle tag off, put this one on. */
async function setObstacleTag(contactId: string, obstacle: string) {
  const tag = OBSTACLE_TAGS[obstacle];
  if (!tag) return;
  try {
    await removeGhlTags(contactId, Object.values(OBSTACLE_TAGS).filter((t) => t !== tag));
  } catch (err) {
    console.warn("pop-qualify: GHL obstacle untag failed", err);
  }
  await addGhlTags(contactId, [tag]);
}

/** Swap the budget tag; a $10,000+ answer adds hot-lead (never removed here, a hot lead stays starred). */
async function setBudgetTags(contactId: string, budget: string) {
  try {
    await removeGhlTags(contactId, BUDGET_TAGS.filter((t) => t !== `budget:${budget}`));
  } catch (err) {
    console.warn("pop-qualify: GHL budget untag failed", err);
  }
  await addGhlTags(contactId, budgetTags(budget));
}

/** Untag the side the lead did not pick. Never fatal: a failed untag must not cost the lead. */
async function dropOtherSide(contactId: string, sellsOnAmazon: "Yes" | "No") {
  try {
    await removeGhlTags(contactId, journeyTags(sellsOnAmazon === "Yes" ? "No" : "Yes"));
  } catch (err) {
    console.warn("pop-qualify: GHL untag failed", err);
  }
}

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

  const [firstName, ...rest] = lead.name.split(/\s+/);

  if (lead.stage === "details") {
    try {
      const contact = await upsertGhlContact({
        firstName,
        lastName: rest.join(" ") || undefined,
        name: lead.name,
        email: lead.email.toLowerCase(),
        phone,
        source: "apex-pop-web",
        customFields: utmCustomFields(lead),
      });
      await addGhlTags(contact.id, ["pop-web-started"]);
    } catch (err) {
      if (err instanceof GhlNotConfigured) {
        return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
      }
      console.error("pop-qualify: GHL details write failed", err);
      return NextResponse.json({ error: "We could not save your details. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  /**
   * The moment the journey card is tapped: the field and the tags land at
   * once, so a lead who stops before the obstacle question is already
   * sorted for the nurture that fits them.
   */
  if (lead.stage === "journey") {
    if (!lead.sellsOnAmazon) {
      return NextResponse.json({ error: "Pick an answer." }, { status: 400 });
    }
    try {
      const contact = await upsertGhlContact({
        firstName,
        lastName: rest.join(" ") || undefined,
        name: lead.name,
        email: lead.email.toLowerCase(),
        phone,
        source: "apex-pop-web",
        customFields: [{ key: "sells_on_amazon", value: lead.sellsOnAmazon }],
      });
      // Changing the answer swaps the tags rather than stacking both sides.
      await dropOtherSide(contact.id, lead.sellsOnAmazon);
      await addGhlTags(contact.id, journeyTags(lead.sellsOnAmazon));
    } catch (err) {
      if (err instanceof GhlNotConfigured) {
        return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
      }
      console.error("pop-qualify: GHL journey write failed", err);
      return NextResponse.json({ error: "We could not save your answer. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!lead.sellsOnAmazon || !lead.obstacle) {
    return NextResponse.json({ error: "Pick an answer for each question." }, { status: 400 });
  }

  /** The obstacle card tapped: field and tag at once, same reason as the journey stage. */
  if (lead.stage === "obstacle") {
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
          { key: lead.sellsOnAmazon === "Yes" ? "biggest_obstacle_seller" : "biggest_obstacle_new", value: lead.obstacle },
        ],
      });
      await setObstacleTag(contact.id, lead.obstacle);
    } catch (err) {
      if (err instanceof GhlNotConfigured) {
        return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
      }
      console.error("pop-qualify: GHL obstacle write failed", err);
      return NextResponse.json({ error: "We could not save your answer. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }
  /** The budget card tapped: field and tags at once. A changed answer swaps the budget tag. */
  if (lead.stage === "budget") {
    if (!lead.budget) return NextResponse.json({ error: "Pick an answer." }, { status: 400 });
    try {
      const contact = await upsertGhlContact({
        firstName,
        lastName: rest.join(" ") || undefined,
        name: lead.name,
        email: lead.email.toLowerCase(),
        phone,
        source: "apex-pop-web",
        customFields: [{ key: "inventory_budget", value: budgetLabel(lead.budget) }],
      });
      await setBudgetTags(contact.id, lead.budget);
    } catch (err) {
      if (err instanceof GhlNotConfigured) {
        return NextResponse.json({ error: "Lead capture is not configured." }, { status: 503 });
      }
      console.error("pop-qualify: GHL budget write failed", err);
      return NextResponse.json({ error: "We could not save your answer. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  const starterKit = lead.obstacle === STARTER_KIT_ANSWER;
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
        ...(lead.budget ? [{ key: "inventory_budget", value: budgetLabel(lead.budget) }] : []),
        ...utmCustomFields(lead),
      ],
    });
    await dropOtherSide(contact.id, lead.sellsOnAmazon);
    await setObstacleTag(contact.id, lead.obstacle);
    if (lead.budget) await setBudgetTags(contact.id, lead.budget);
    await addGhlTags(contact.id, [
      ...journeyTags(lead.sellsOnAmazon),
      "pop-web-lead",
      starterKit ? "pop-starter-kit" : "pop-demo-lead",
      ...(lead.offer === "dollar-week" ? ["pop-dollar-week"] : []),
    ]);
    await addGhlNote(
      contact.id,
      [
        `Apex Pop website qualifier (${lead.from ?? "apex-pop"})`,
        `Sells on Amazon: ${lead.sellsOnAmazon}`,
        `Biggest obstacle: ${lead.obstacle}`,
        lead.budget ? `${HOT_BUDGETS.includes(lead.budget) ? "🔴 HOT LEAD: " : ""}Inventory budget: ${budgetLabel(lead.budget)}` : null,
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

  /**
   * Every path ends at the free account now, the under-$1,000 answer included:
   * that visitor is shown what the trial hands over rather than sent to the
   * $29 kit (Stefano, 2026-09-29). The pop-starter-kit tag stays so GHL can
   * still tell the segment apart.
   */
  return NextResponse.json({ next: "signup" });
}
