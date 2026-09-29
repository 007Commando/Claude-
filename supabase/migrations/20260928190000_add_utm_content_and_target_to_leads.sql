-- The nurture-v2 email sequence (marketing/nurture-v2/03-plan.md) routes every
-- CTA through /go/<target>?e=<EMAIL_ID>. That router stores the click as a
-- `nurture_click` event carrying the standard utm_content slot (the
-- EMAIL_ID, e.g. SELLER_09) plus which app destination the click was headed
-- to, neither of which the leads table had a column for.
--
-- utm_content is the general-purpose UTM slot (already read as a query param
-- elsewhere in this app, see src/lib/proposalAngles.ts), so it is named to
-- match rather than invented as something nurture-specific -- any future
-- campaign that sets utm_content gets it for free.
--
-- Additive and nullable: every existing row and every existing reader is
-- unaffected.
alter table public.leads add column if not exists utm_content text;
alter table public.leads add column if not exists target text; -- the /go/<target> destination, e.g. 'trial', 'scan'

create index if not exists leads_utm_content_idx on public.leads (utm_content) where utm_content is not null;
