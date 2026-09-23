-- Google click identifiers, for offline conversion import.
--
-- A paid Google click arrives carrying `gclid` (or `wbraid`/`gbraid` when the
-- journey crossed an app or an iOS privacy boundary). Google will accept a
-- conversion uploaded against that identifier weeks later, which is the only
-- way it can ever learn that a trial turned into a paying customer: the charge
-- happens seven days after the click, on Stripe's side, long after the browser
-- session that could have fired a tag.
--
-- It has to be captured at the moment of the click. There is no backfill for a
-- click id nobody wrote down, so these columns exist before the first campaign
-- runs rather than after the first month of spend is unattributable.
--
-- Additive and nullable: every existing row and every existing reader is
-- unaffected.
alter table public.leads add column if not exists click_id text;
alter table public.leads add column if not exists click_source text; -- 'gclid' | 'wbraid' | 'gbraid'

-- The import job looks rows up by click id, and by email to find the click id
-- belonging to a customer Stripe has just charged.
create index if not exists leads_click_id_idx on public.leads (click_id) where click_id is not null;
