# Apex Google Search + YouTube programme

A complete paid programme for Apex Applications: 9 search campaigns, 47 ad
groups, 1,314 keywords, 818 negatives, 45 responsive search ads, 7 YouTube and
Demand Gen campaigns, and 10 video scripts.

**Everything ships paused.** Nothing spends until the tracking in
`05-tracking.md` is live and verified, because there is currently no Google tag
on the website at all.

## Read in this order

| File | What it answers |
| --- | --- |
| `01-strategy.md` | Budgets, target CPA and the maths behind it, bidding phases, the trademark constraint, rollout |
| `02-search-campaigns.md` | Every campaign, why its keywords and negatives look the way they do |
| `03-youtube.md` | YouTube and Demand Gen: custom segments, placements, remarketing, exclusions |
| `04-video-scripts.md` | Ten scripts, shot by shot, with the text assets |
| `05-tracking.md` | What was built, what Stefano has to do, how to verify it |

## Importing

`import/` holds Google Ads Editor CSVs, numbered in load order. Editor may ask
you to map a column or two; the headers use Editor's own names.

```bash
python3 build.py
```

Regenerates every CSV and validates the copy first: 30 characters for a
headline, 90 for a description, 15 for a path, no dash punctuation anywhere a
customer reads, and **no rival's name in any conquest ad**. The build fails
rather than shipping copy Google will reject.

Edit `build.py`, never the CSVs. They are output.

## Three things that will break this if forgotten

1. **Prices.** Every ad quotes $149/mo and a seven day trial because that is
   what `src/config/offer.ts` publishes today. If `NEW_PRICING_LIVE` flips to
   `true`, Starter becomes $69 and every one of those headlines misprices its
   own landing page, which is a Google policy violation. One constant in
   `build.py`, then reupload the ads.
2. **Never turn on Dynamic Keyword Insertion in a conquest ad group.** It would
   print a competitor's trademark into the headline automatically. Bidding on
   their name is allowed; printing it is not.
3. **Two ad groups cannot be unpaused as shipped.** Third Party Profits and
   Tactical Arbitrage have no page under `/compare/`, so they point at the
   index. Write those two pages or delete the ad groups.
