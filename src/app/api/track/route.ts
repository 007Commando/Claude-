import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "../../../lib/dashboard/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Public ingestion beacon, same trust model as any analytics pixel (GA,
// Meta Pixel, etc.) — no secret to protect, just light shape validation.
const trackSchema = z.object({
  source: z.string().trim().min(1).max(40),
  event: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(255).optional(),
  visitorId: z.string().trim().max(120).optional(),
  url: z.string().trim().max(2048).optional(),
  referrer: z.string().trim().max(2048).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  // Google click identifier, for offline conversion import. Captured here
  // because there is no backfill for a click id nobody wrote down.
  clickId: z.string().trim().max(255).optional(),
  clickSource: z.string().trim().max(16).optional(),
  // The general UTM content slot. The nurture-v2 router (/go/<target>) sets
  // this to the EMAIL_ID (e.g. SELLER_09) so a trial that follows can be
  // traced back to the email without GHL.
  utmContent: z.string().trim().max(120).optional(),
  // Which app destination a router click was headed to (trial, scan, ...).
  // Only meaningful alongside a nurture_click event.
  target: z.string().trim().max(40).optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Tracking is not configured" },
      { status: 503, headers: CORS_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS_HEADERS });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const {
    source,
    event,
    email,
    visitorId,
    url,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    clickId,
    clickSource,
    utmContent,
    target,
  } = parsed.data;

  const baseRow = {
    source,
    event,
    email: email ?? null,
    visitor_id: visitorId ?? null,
    url: url ?? null,
    referrer: referrer ?? null,
    utm_source: utmSource ?? null,
    utm_medium: utmMedium ?? null,
    utm_campaign: utmCampaign ?? null,
    click_id: clickId ?? null,
    click_source: clickSource ?? null,
  };

  let { error } = await admin.from("leads").insert({
    ...baseRow,
    utm_content: utmContent ?? null,
    target: target ?? null,
  });

  // The utm_content/target columns arrive with the 20260928190000 migration.
  // Until it is applied, PostgREST rejects the row with "column ... does not
  // exist" (PGRST204 / 42703); keep the click rather than lose it.
  if (error && /utm_content|target/.test(error.message) && /column|schema cache/i.test(error.message)) {
    ({ error } = await admin.from("leads").insert(baseRow));
  }

  if (error) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS });
}
