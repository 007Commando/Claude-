import { getSupabaseAdmin } from "./supabaseAdmin";

export interface LeadRow {
  id: string;
  createdAt: string;
  source: string;
  event: string;
  email: string | null;
  visitorId: string | null;
  utmSource: string | null;
}

export interface LeadsSummary {
  connected: boolean;
  error?: string;
  recent: LeadRow[];
}

interface RawLeadRow {
  id: string;
  created_at: string;
  source: string;
  event: string;
  email: string | null;
  visitor_id: string | null;
  utm_source: string | null;
}

const empty: LeadsSummary = {
  connected: false,
  recent: [],
};

/** Raw touchpoint log for the Apex site (landings + signups). PrimeWell's own
 * funnel is tracked in GHL directly — see ghlPrimewell.ts. */
export async function getLeadsSummary(): Promise<LeadsSummary> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { ...empty, error: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set" };
  }

  const { data, error } = await admin
    .from("leads")
    .select("id, created_at, source, event, email, visitor_id, utm_source")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return { ...empty, error: error.message };
  }

  const rows = (data ?? []) as RawLeadRow[];

  return {
    connected: true,
    recent: rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      source: r.source,
      event: r.event,
      email: r.email,
      visitorId: r.visitor_id,
      utmSource: r.utm_source,
    })),
  };
}
