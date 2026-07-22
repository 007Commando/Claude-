import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OAIQ_PIXEL_ID = "8iBamdbpfEKYXHWyzY5p8i";
const OAIQ_EVENTS_URL = `https://bzr.openai.com/v1/events?pid=${OAIQ_PIXEL_ID}`;

const bodySchema = z.object({
  sourceUrl: z.string().trim().max(2048).optional(),
});

// Server-side backup for the client-side oaiq pixel — same trial_started
// event, sent via OpenAI's Conversions API so it isn't lost to ad blockers.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OAIQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OAIQ_API_KEY is not set" }, { status: 503 });
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
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(OAIQ_EVENTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: false,
        events: [
          {
            id: crypto.randomUUID(),
            type: "trial_started",
            timestamp_ms: Date.now(),
            source_url: parsed.data.sourceUrl ?? "https://apexapplications.io/auth",
            action_source: "web",
            data: { type: "plan_enrollment" },
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: `oaiq events API failed: ${res.status} ${text.slice(0, 200)}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reach oaiq events API" },
      { status: 502 },
    );
  }
}
