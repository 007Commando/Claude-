# Conversion tracking

Nothing in this folder should be unpaused until this file is finished. A
conquest campaign without conversion tracking is a way to buy competitor-level
clicks and learn nothing from them.

---

## What was found

`src/app/layout.tsx` loaded the Meta pixel, the OpenAI pixel and the GHL
tracker, and **no Google tag of any kind**. No gtag.js, no GA4, no Google Ads.

Consequences, all three of which are the same missing tag:

1. Google Ads could not count a conversion.
2. No remarketing list could be built, so Y04, Y05 and Y06 in `03-youtube.md`
   had nothing to target.
3. Smart Bidding was unavailable, because it has nothing to bid toward.

---

## What was built in this session

| Change | File | Effect |
| --- | --- | --- |
| gtag.js for GA4 and Google Ads | `src/components/GoogleTag.tsx` (new), wired into `src/app/layout.tsx` | Renders nothing until an id is set. Enhanced conversions enabled. |
| `reportConversion()` helper | `src/components/GoogleTag.tsx` | Fires a labelled conversion, optionally with value and hashed email. No-ops when the tag is absent. |
| Google click id capture | `src/components/LeadAttribution.tsx` | Reads `gclid`, `wbraid` or `gbraid` off the landing URL and stores it. |
| Click id on the signup event | `src/components/Auth.tsx`, `src/components/ZeroToHero.tsx` | The click id reaches `/api/track` alongside the email. |
| Click id storage | `src/app/api/track/route.ts`, `supabase/migrations/20260923120000_add_click_id_to_leads.sql` | `leads.click_id` and `leads.click_source`, additive and nullable. |

The click id capture matters more than it looks. **There is no backfill for a
click id nobody wrote down.** A customer who clicks an ad today and pays in
fourteen days can only be attributed if the identifier was written down at the
moment of the click, so this ships before the first campaign runs rather than
after the first unattributable month.

One subtlety handled in `LeadAttribution`: auto-tagging adds `gclid` whether or
not a tracking template adds `utm_source`, so a paid Google click can arrive
carrying a click id and nothing else. When that happens to a visitor who
already has stored attribution, for instance a PrimeWell applicant who later
clicks an ad, the first-touch source is kept and only the click id is
refreshed. Overwriting the source would give them the wrong onboarding
walkthrough; dropping the click id would cost the conversion upload.

Typecheck passes (`npx tsc --noEmit`, clean).

---

## Still to do, and who can do it

### 1. Stefano, about 30 minutes, blocks everything

1. Create the Google Ads account at ads.google.com. **Skip Smart Mode**, which
   is the default for new accounts and cannot import from Editor. Choose expert
   mode.
2. Create a GA4 property for www.apexapplications.io and link it to Google Ads.
3. Paste two variables into Vercel for the `newwebsite` project, production:
   ```
   NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
   ```
4. Redeploy, then confirm with Google Tag Assistant that both fire on the
   homepage.
5. Run the migration: `npx supabase db push` from `apex-app/`.

### 2. Create the conversion actions

In Google Ads, Goals, Conversions. Five actions, and **only one is primary**.

| Action | Category | Count | Value | Window | Primary |
| --- | --- | --- | --- | --- | --- |
| Trial Started | Start trial | One | $250 | 30 day click, 3 day engaged view | **Yes** |
| Free Account Created | Sign up | One | $15 | 30 day click | No |
| Checkout Started | Begin checkout | One | $25 | 30 day click | No |
| Call Booked | Contact | One | $40 | 30 day click | No |
| Paid Customer | Purchase | One | first invoice amount | 90 day click | No, imported |

An account that marks five actions primary has a target CPA that means nothing.
Trial Started is the bid target because it happens often enough for a bid
strategy to learn from; Paid Customer happens one to three times a week, which
is not enough to leave the learning phase, ever.

Turn on **enhanced conversions for web** while you are in there. The tag is
already configured for it.

### 3. Wire the four web conversions

**Not done in this session, on purpose.** Each conversion action has a label
that only exists once the action is created, and the call sites sit inside the
signup flow, which is the one path in this business that must not break to save
an afternoon. Ten minutes of work once the labels exist, in these four places:

| Conversion | Where it fires | Note |
| --- | --- | --- |
| Checkout Started | every CTA that opens `TRIAL_CHECKOUT_URL` | Fire before the redirect, not after. |
| Trial Started | `src/components/Auth.tsx`, on the return from Stripe with `session_id` present | The payment link redirects back to `/auth`, which is on www, so this can be a web conversion. Pass the email for enhanced conversions. Deduplicate on `session_id` via `transactionId`. |
| Free Account Created | `src/components/Auth.tsx`, free signup success | |
| Call Booked | the Calendly embed's `calendly.event_scheduled` postMessage on the program pages | |

Each one is a single `reportConversion("labelFromGoogle", { ... })` call.

### 4. Offline import for Paid Customer

The piece that makes every other number honest. The backend already does this
shape for Meta: `backend/src/api/meta/index.ts` sends `Purchase` from the
Stripe webhook. Google needs the same event sent a different way.

Flow:

1. Stripe invoice paid webhook fires in the backend, as it already does.
2. Look up the customer's email in Supabase `leads`, newest row with a
   non-null `click_id`.
3. Upload to the Google Ads API `ConversionUploadService`, as a
   `ClickConversion` with the `gclid` (or `wbraid`/`gbraid`), the conversion
   action resource name for **Paid Customer**, the conversion time and the
   invoice amount.
4. Needs a Google Ads developer token, an OAuth refresh token and the customer
   id. None exist yet, and none can exist until step 1 of this file is done.

Alternative if the API is more than this is worth at current volume: export a
CSV of click id, conversion name, conversion time and value, and upload it by
hand weekly through Google Ads, Goals, Uploads. Same result, ten minutes a
week, no credentials to manage. **Start here.** Automate it when the weekly
upload has more than about twenty rows on it.

### 5. Tracking template

Set at **campaign** level, not account level, so each campaign writes its own
readable name into `utm_campaign` for GHL and the marketing dashboard:

```
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=CAMPAIGN_NAME&utm_content={adgroupid}&utm_term={keyword}&matchtype={matchtype}&device={device}
```

Do **not** add `gclid` by hand. Auto-tagging adds it, and adding it twice
produces a URL Google will reject.

Leave **auto-tagging on**. `LeadAttribution` now reads what it appends.

---

## How to verify before spending a dollar

1. Tag Assistant: gtag fires on the homepage, on `/pricing`, on a `/compare/`
   page.
2. Load `https://www.apexapplications.io/?gclid=TEST123` and confirm
   `apex_attribution` in localStorage carries `clickId: "TEST123"`.
3. Check the `leads` table has a row with `click_id = 'TEST123'`.
4. Run one test signup and confirm the click id lands on the row that also
   carries the email. **This is the join the whole measurement plan rests on.**
   If it is broken, nothing downstream can be fixed later.
5. Google Ads conversion diagnostics show "recording conversions" rather than
   "no recent conversions".

Only then unpause a campaign.
