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

  const { source, event, email, visitorId, url, referrer, utmSource, utmMedium, utmCampaign } =
    parsed.data;

  const { error } = await admin.from("leads").insert({
    source,
    event,
    email: email ?? null,
    visitor_id: visitorId ?? null,
    url: url ?? null,
    referrer: referrer ?? null,
    utm_source: utmSource ?? null,
    utm_medium: utmMedium ?? null,
    utm_campaign: utmCampaign ?? null,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: CORS_HEADERS });
}
