import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Untyped on purpose: src/integrations/supabase/types.ts is auto-generated
// from the live schema and doesn't know about the `leads` table (added via
// supabase/migrations/) until someone runs `supabase gen types` again.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  if (!client) {
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
