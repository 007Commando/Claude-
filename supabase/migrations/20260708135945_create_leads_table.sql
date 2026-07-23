-- Tracks every lead touchpoint across properties (PrimeWell, Apex, ads) so the
-- marketing dashboard can join them into one funnel by email/visitor id.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,       -- 'primewell' | 'apex' | 'facebook' | 'direct' | ...
  event text not null,        -- 'page_view' | 'primewell_signup' | 'apex_landing' | 'apex_signup'
  email text,
  visitor_id text,
  url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_event_idx on public.leads (event);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_visitor_id_idx on public.leads (visitor_id);

-- RLS is enabled with no policies: only the service-role key (used
-- server-side by /api/track and the dashboard) can read or write.
alter table public.leads enable row level security;
