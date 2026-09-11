import { NextResponse } from "next/server";
import { getCrossFunnelSummary } from "../../../../lib/dashboard/crossFunnel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Separate from /api/dashboard/summary on purpose: this pages through both
// locations' full contact lists (~5-10s), and the summary is what gates the
// dashboard's first paint. The card loads it lazily instead.
export async function GET() {
  const summary = await getCrossFunnelSummary();
  return NextResponse.json(summary);
}
