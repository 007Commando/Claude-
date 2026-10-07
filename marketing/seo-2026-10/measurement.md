# Measuring organic search, AI referrals and conversions

What is tracked today, what was added in October 2026, and how to read the results. Nothing here
claims a ranking or traffic change; those have to be measured after the release.

## What the site sends today

| Event | Where | Counts as |
|---|---|---|
| GA4 page views | `GoogleTag.tsx` (NEXT_PUBLIC_GA4_ID) | Traffic |
| `cta_click` (new) | `GoogleTag.tsx`, any element with `data-cta="<name>"` | A click only. Never a conversion. Sends the button name and page path, nothing else. |
| Google Ads `Checkout Started` | `Auth.tsx` | Intent |
| Google Ads `Trial Started` | `Auth.tsx`, on return from Stripe with the session id (deduplicated) | The real trial conversion |
| Google Ads `Booking Started` | any click to Calendly | Intent; the confirmed booking comes from Calendly's API |
| `/api/track` (first-party lead events, e.g. `apex_signup`) | `Auth.tsx` and funnels | **Broken in production:** answers 503 because the Vercel project has no Supabase credentials. See "Actions" below. |
| Meta pixel, Reddit pixel, OpenAI pixel | layout | Ads platforms |

`cta_click` names in use: `home-hero-trial`, `home-hero-pricing`, `home-green`, `home-ai`,
`home-plans`, `home-footer-trial`. Add `data-cta` to any new button rather than writing a new event.

Not tracked (by design): anything typed into a form, API keys, prompts, emails in GA4, account data.

## Reading organic performance (Search Console)

1. **Non-branded organic clicks:** Performance > Search results > add a Query filter "Doesn't
   contain" `apex` (and `apexapplications`). Compare 28 days before and after the release date.
2. **Priority pages:** Pages tab, filter each of `/`, `/ai`, `/amazon-wholesale-software`,
   `/features/green`, `/features/blue`, `/tools/fba-calculator`, `/blog/amazon-fba-fees-explained`;
   then the Queries tab for that page. Record impressions, clicks, position monthly.
3. **Indexing coverage:** Indexing > Pages. Note "Discovered, currently not indexed" and "Crawled,
   currently not indexed" counts and which URLs; inspect priority ones with URL Inspection.
4. **Baseline (from Search Console, 3 months to 2026-09-29):** 108 clicks, 4.58K impressions,
   average position 33; 84 pages indexed, 51 not (28 of them redirects).

## Trials and paid conversions from organic

- GA4: Acquisition > Traffic acquisition, session default channel "Organic Search", with the
  `Trial Started` conversion (imported from Google Ads or as a GA4 key event).
- Lead Desk already shows each lead's first source and converting touch; once `/api/track` is
  fixed, website signups carry their first-touch source into it.
- Paid conversion: Stripe subscription status (the Lead Desk's Stripe reconciliation) is the truth.
  Never count a button click as a signup or a signup as a payment.

## AI referrals

- In GA4, create an exploration with Session source matching
  `chatgpt.com|chat.openai.com|perplexity.ai|claude.ai|gemini.google.com|copilot.microsoft.com`.
- These numbers are a floor, not a count: many assistant answers carry no referrer, links are
  often copied rather than clicked, and an assistant's answer to the same question varies by
  wording, account, location and date. Treat sampled "does ChatGPT recommend Apex" checks as
  anecdotes, not a metric.

## Core Web Vitals

Lab measurements from one Mac (Lighthouse 12, October 7, 2026) are in the session notes; they swing
by up to 30 points between runs on mobile. Real-user data is the Core Web Vitals report in Search
Console (and CrUX), which needs traffic volume before it appears. Compare like with like.
