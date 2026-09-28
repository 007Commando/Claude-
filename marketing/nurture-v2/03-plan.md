# Nurture v2: build plan

Decisions, 2026-09-28 (Stefano): runs in **GoHighLevel workflows**; **text-first
launch**, visuals added as recordings exist; em dashes replaced, "repetitive
shit" softened to "repetitive work". Copy source: `01-brief.md`. Metadata:
`emails.csv` (schema in `02-tagging-system.md`).

## What replaces what

- "Apex Pop Promotion: 5-day nurture (no trial yet)" (v1, 6 emails/SMS over
  days 5 to 11) stops taking new entrants the day v2 publishes. People already
  inside v1 finish it; they are not re-enrolled into v2 (they would get
  overlapping copy).
- v2 is 24 emails per track over 105 days, entry on day 5. No SMS in v2; the
  day-0 to day-3 texts (follow-up workflows, Aliza) stay as they are.

## Who enters, and which track

Trigger: contact tag added, any of `pop-demo-lead` (Facebook qualified lead),
`primewell-lead` (the /primewell form), `stage:registered` (any account
created). Allow re-entry OFF, so a contact who hits two of these enters once.

Router workflow "Nurture v2: router":
1. Wait until day 5 (5 **days**, check the unit).
2. If tags include `stage:trial` or `stage:customer`: end.
3. Track: `Sells on Amazon` = Yes → **Track A** (tag `nurture-v2-seller`);
   otherwise → **Track B** (tag `nurture-v2-beginner`). PrimeWell contacts have
   no answer to that question; they applied to a wholesale distributor, so
   they are treated as sellers (source contains "PrimeWell" → Track A).
4. Set `nurture_v2_track` and `nurture_v2_entered_at`.

Two workflows, "Nurture v2: Track A (sellers)" and "Nurture v2: Track B
(beginners)", each triggered by its tag. Each email step is preceded by an
"Update contact field" that writes `nurture_v2_last_email = <EMAIL_ID>`, then
the email, then a wait to the next send day. Waits are the gaps between the
brief's days: 1,1,1,1,1,1,1,1,1,2,2,2,3,3,4,5,7,7,7,9,10,15,15.

Exit: the existing "Apex Pop Promotion: exit nurture when trial starts"
gains the two v2 workflows in its Remove-from-workflow action (triggers:
`stage:trial`, `stage:customer`). Before removing, it copies
`nurture_v2_last_email` into `nurture_v2_trial_email`; that one field is what
"trial starts per email" is counted from.

Settings: send window 9:00 to 19:00 in the contact's timezone, seven days;
stop on response ON (a reply means a person is now talking to them; Aliza or
Stefano decides what happens next). Sender "Stefano at Apex"
<info@apexapplications.io>.

## The emails in GHL

Created as **Email Builder templates by API** (plain-text style HTML, one
template per EMAIL_ID, named `Nurture v2 | <EMAIL_ID> | <subject>`), so the
workflow builder work is choosing a template and typing a subject, not typing
48 bodies. Templates are the editable source; a change to one template
changes the live email without touching the workflow.

Body style: short paragraphs, no images until an asset exists, one CTA link,
the founder sign-off as "Stefano" plus "Apex Applications" on the next line
(no em dash). First name via `{{contact.first_name}}`, with the empty case
handled by GHL's default value.

## Links: one router, full attribution

Every CTA points at the marketing site's router page:

    https://www.apexapplications.io/go/<target>?e=<EMAIL_ID>

`/go/[target]` (Next.js) does three things: records the click
(`/api/track` event `nurture_click` with the EMAIL_ID and target), stores
`utm_source=nurture&utm_medium=email&utm_campaign=nurture-v2&utm_content=<EMAIL_ID>`
the same way LeadAttribution stores any campaign, then forwards:

| target | signed in to Apex | not signed in |
|---|---|---|
| trial | app `/?start=trial` (Stripe checkout) | `/auth?mode=signup&plan=starter&period=monthly` |
| open | app `/dashboard` | `/auth?mode=signup&plan=free` |
| scan | app `/upc-scanner` | signup |
| suppliers | app `/rewards/distributors` | signup |
| po | app `/purchase-orders` | signup |
| restock | app `/inventory` | signup |
| reviews | app `/review-booster` | signup |
| repricing | app `/strategy` | signup |
| pnl | app `/opex` | signup |
| brands | app `/brands` | signup |
| ungating | app `/ungating` | signup |
| walkthrough | app `/dashboard` (the walkthrough offers itself) | signup |

Signed-in state comes from apex-auth.js, which the marketing site already
loads. A signup that starts from a router link carries `utm_content=<EMAIL_ID>`
into the `leads` row and the account's acquisition, so a trial that follows
can be traced to the email even without GHL.

## Assets, and what ships when

Text-only emails (39) ship at launch. The rest:

- **GIF emails** (SELLER_01, 03, 05, 07, 09, 10, 18; BEGINNER_10): ship at
  launch *without* the GIF and with the placeholder line removed; the copy
  reads fine. When Stefano records the screens (Cmd+Shift+5, one flow per
  file, 10 to 20 seconds each), the GIFs are made from the recordings and the
  templates updated. Recordings needed: catalog scan, PO builder, restocking,
  Review Booster switch, bulk ungating check, P&L Sankey, repricer.
- **Proof emails** (SELLER_06, SELLER_20, BEGINNER_13): real Trustpilot
  reviews quoted as text with name, country and date, linked to the profile.
  Screenshots replace the text when made. Reviews on the profile as of
  2026-09-28: Sachia Venter (CA), Maria Sanfilippo (US), Abu Sayed (BD),
  Salvatore Spagnolo (IT), plus two more; 4.2 average, 6 reviews.
- **SELLER_13 "$39,694 Amazon payout"**: not built until a verified customer
  result and permission exist. The day-20 slot is simply a gap until then.
- **Day 65 seasonal** (both tracks): built with the Q4 copy, which is true
  for anyone reaching day 65 before mid-December. Swap the copy on 1 December
  to the January-planning version; the tag record keeps SEASON_OR_EVENT.
- **BEGINNER_07 diagram**: the flow line is typed as text; a diagram image
  can replace it later.

## Measuring

Per email: opens, clicks, unsubscribes from the workflow's email statistics
in GHL (read monthly, written into `emails.csv`'s performance columns);
trial starts from contacts where `nurture_v2_trial_email = <EMAIL_ID>`
(GHL contacts search by custom field, scriptable through the API); replies
from the conversation, tagged by Aliza. Signups and trials that started from
a router link also show in the marketing dashboard by `utm_content`.

First read at 30 days, real conclusions at 60. The analysis rules in
`02-tagging-system.md` apply: compare mechanisms, not emails; correct for
SEND_DAY, because a day-56 recipient survived 55 days of not converting.

## Order of work

1. `emails.csv` (in progress), then the copy pass: dashes, softening,
   placeholders out, review quotes in, CTA links in the router form.
2. 48 templates by API.
3. `/go/[target]` router on the marketing site, deployed.
4. Custom fields (done: `nurture_v2_track`, `nurture_v2_last_email`,
   `nurture_v2_trial_email`, `nurture_v2_entered_at`), router workflow, two
   track workflows, exit workflow update. Built by agents in the GHL UI, one
   track at a time, every wait's unit checked.
5. Stefano reads all 48 in GHL's preview and approves; test send of three
   to his inbox; publish v2; v1 trigger disabled.
