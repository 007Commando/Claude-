# YouTube and Demand Gen

Search catches the seller who has already decided something is wrong. YouTube
is where this particular buyer spends the hours before that: Amazon sellers
learn their trade on YouTube, and they watch their software being demonstrated
on YouTube, including their current software.

That last part is the whole opportunity. Search conquest waits for someone to
type "sellerboard alternative". YouTube conquest reaches them **while they are
watching a sellerboard tutorial**, which is often the moment the friction is
actually being felt.

Seven campaigns, in the order they should be switched on.

---

## Targeting instruments, ranked by precision

Worth being clear about which lever does what, because three of them sound
similar and only two of them are sharp.

| Instrument | What it reaches | Precision |
| --- | --- | --- |
| **Custom segment, search terms** | People who searched these exact phrases on Google recently | Highest. This is search conquest, delivered on YouTube. |
| **Video placements** | Anyone watching one specific video | Highest, and controllable video by video |
| **Channel placements** | Anyone watching one channel | High |
| **YouTube search keywords** | People searching *on YouTube* right now | High, low volume |
| **Custom segment, URLs** | People who browse sites like these | Medium. Google infers interest from the domain's topic. |
| In-market / affinity | Google's own audience buckets | Low. Use as a layer, never alone. |

The first three carry this plan. The rest are scale, once the first three prove
the creative works.

---

## Y01 | Conquest by custom segment

**Type:** Video, Drive conversions (Video action campaign)
**Format:** Skippable in-stream + in-feed
**Budget:** $10/day to start, the whole YouTube budget in week 3
**Bidding:** Maximise conversions, no target CPA until 30 conversions exist

**Build two custom segments.** Google Ads, Tools, Audience manager, Custom
segments.

**Segment `Rival search intent`**, using "people who searched for any of these
terms on Google". Paste exactly this list:

```
sellerboard
sellerboard alternative
selleramp
selleramp sas
smartscout
smart scout
goaura
aura repricer
sellersnap
third party profits
bqool
informed repricer
repricer.com
scan unlimited
rocket source
seller assistant app
inventorylab
tactical arbitrage
amazon repricer
amazon repricing software
amazon wholesale software
supplier price list scanner
amazon wholesale suppliers
```

Note that the non-brand terms are in there too. A custom segment blends signals
rather than intersecting them, so adding "amazon repricer" widens reach toward
the same buyer rather than diluting it toward a different one.

**Segment `Rival browsing`**, using "people who browse websites similar to".
Paste:

```
sellerboard.com
selleramp.com
smartscout.com
goaura.com
sellersnap.io
bqool.com
informed.co
repricer.com
scanunlimited.com
rocketsource.io
sellerassistant.app
inventorylab.com
tacticalarbitrage.com
sellercentral.amazon.com
```

Use the two segments in **separate ad groups**, never combined, so the report
says which instrument worked.

**Creative:** `CONQ-60` and `CONQ-30` from `04-video-scripts.md`.

---

## Y02 | Conquest by placement

**Type:** Video, Drive conversions
**Format:** Skippable in-stream, in-feed
**Budget:** shares Y01's budget in week 3, own line from week 5

Two ad groups.

**`Placements | Rival tutorials`.** Video-level placements. The method, because
channel IDs cannot be guessed and should never be pasted from memory:

1. Google Ads, Tools, Planning, **Placement Planner**, or the campaign's
   placement picker.
2. Search each rival name plus the words tutorial, review, walkthrough, setup,
   pricing: `sellerboard tutorial`, `selleramp review`, `aura repricer setup`,
   `smartscout walkthrough`, `sellersnap review`.
3. Add the individual **videos**, not the channels, where the video is
   instructional content about that tool. Someone watching a 20 minute
   sellerboard setup video is mid-commitment, which is exactly when a
   comparison lands.
4. Target 40 to 80 video placements. Below 40 it will not deliver.

**`Placements | Wholesale education`.** Channel-level placements on the
channels that teach Amazon wholesale. Build this list in Placement Planner by
searching `amazon wholesale`, `amazon fba wholesale`, `wholesale sourcing
amazon`, `amazon wholesale suppliers`, and sorting by available impressions.

Candidate names to look up rather than take on trust, since none of these can
be verified from here: The Wholesale Formula, Corey Ganim, Todd Welch,
Jungle Scout, Helium 10, Just One Dime, Amazon Seller School, Reezy Resells,
Nate Ginsburg. **Verify each one is genuinely about wholesale before adding
it.** Half of the big FBA channels are private label, and a private-label
audience will watch the ad, click it and never buy this product.

Exclude channels that are primarily dropshipping, retail arbitrage or "make
money online".

---

## Y03 | YouTube search keywords

**Type:** Video, Drive conversions
**Format:** In-feed video ads only. In-feed is the format that appears beside
search results, which is the point of this campaign.
**Budget:** $5/day from week 5

Keyword targeting, on YouTube search rather than Google search:

```
sellerboard tutorial, selleramp tutorial, aura repricer review,
smartscout tutorial, sellersnap review, amazon repricer setup,
amazon wholesale software, how to scan a supplier price list,
amazon wholesale sourcing, bulk asin scanner, amazon ungating,
amazon wholesale suppliers, amazon purchase order, fba restock planner
```

Low volume, very high intent, and cheap. The thumbnail and the first line of
the title do the work here, not the video.

---

## Y04 | Remarketing

**Type:** Video, Drive conversions
**Budget:** $5/day, raise as lists grow
**Blocked until:** the Google tag is live. None of these lists exist today.

Lists to build in GA4, then import to Google Ads. Membership durations matter;
a wholesale software decision takes weeks, not days.

| List | Definition | Duration |
| --- | --- | --- |
| `All visitors` | any page | 90 days |
| `Comparison readers` | page path contains `/compare/` | 180 days |
| `Pricing viewers` | `/pricing` | 90 days |
| `Checkout abandoners` | `Checkout Started` without `Trial Started` | 30 days |
| `Free account, no trial` | `Free Account Created` without `Trial Started` | 180 days |
| `Video viewers` | linked YouTube channel, viewed any ad | 90 days |
| `Converters` | `Trial Started` or `Paid Customer` | 540 days, **excluded everywhere** |

Three ad groups, three different messages, because a comparison reader and a
checkout abandoner are not at the same point:

- `Comparison readers` and `Pricing viewers` → `RMK-30` (the objection video)
- `Checkout abandoners` → `RMK-15` (finish the trial, nothing charged for
  seven days)
- `Free account, no trial` → `UPG-30` (you have the account, here is what the
  paid side does)

**Exclude `Converters` from every campaign in the account**, search included.
Paying $4 to advertise to someone who already pays $149 a month is a rounding
error that compounds.

---

## Y05 | Demand Gen

**Type:** Demand Gen
**Budget:** $10/day
**Not before:** a converter list of 100+ exists, which is the seed a lookalike
needs

Lookalike segment from `Converters`, narrow at first. Demand Gen runs across
YouTube feed, Shorts and Discover, so it needs vertical 9:16 and square 1:1
assets, not just 16:9. Every script in `04-video-scripts.md` is framed to be
cropped to all three.

This is the scale campaign. It is last on purpose: a lookalike built from four
paying customers models noise.

---

## Y06 | Bumpers, reinforcement layer

**Type:** Video, Video reach (bumper)
**Format:** 6 seconds, non-skippable
**Budget:** $3/day
**Targeting:** remarketing lists only, never cold

Bumpers do not convert and should not be measured as if they do. This campaign
exists so the person who watched a 60 second ad last week sees the logo three
more times before they read the comparison page. Frequency cap: **2 per day, 8
per week.**

---

## Y07 | Ad sequence

**Type:** Video, Ad sequence
**Budget:** $5/day, from week 8
**Targeting:** custom segment `Rival search intent`

The sophisticated version of the conquest play, and only worth running once
`CONQ-60` has proven it holds attention:

1. **Step 1:** `CONQ-60`, the problem. Advance on impression.
2. **Step 2:** `DEMO-90`, the screen recording. Advance on view.
3. **Step 3:** `PROOF-30`, the honest comparison. Advance on view.
4. **Step 4:** `RMK-15`, the trial. Advance on impression.

Sequences deliver slowly and cost more per person. The payoff is that the
argument arrives in order rather than in fragments.

---

## Exclusions, set once at account level

- **Content:** exclude embedded videos, live streaming, games, "not yet
  labelled" content, and parked domains.
- **Inventory type:** Limited inventory. This is a B2B software ad; there is no
  upside to appearing beside anything edgy.
- **Made for kids:** excluded. It is also the single most common source of
  wasted YouTube spend on a badly built account.
- **Devices:** keep all, but bid TV down 50% at first. TV screens generate
  views and almost no clicks.
- **Placement exclusion list:** review the placement report weekly for the first
  month and exclude everything that is not plausibly an adult running a
  business.

---

## Creative specs

Every script is delivered in three crops, because the campaigns above need all
three and re-editing later costs more than framing for it now:

- **16:9** 1920x1080, for in-stream
- **9:16** 1080x1920, for Shorts and Demand Gen
- **1:1** 1080x1080, for in-feed and Discover

Shooting rules that matter more than production value:

1. **Hook in the first 5 seconds**, before the skip button. Not the logo, not
   the name. The problem, stated out loud.
2. **Burned-in captions on everything.** A large share of these views are
   muted.
3. **Real screen recordings**, not mockups. The product is the proof: a real
   supplier price list going into Apex Green, real matches coming out, a real
   purchase order being built, the repricer floor being set from landed cost.
4. **No claims the landing page cannot support.** Every number spoken in a
   video has to be defensible, because Google will check the landing page and
   so will the viewer.

---

## What YouTube is measured on

Not view rate. Not cost per view. Both are easy to make look good and neither
pays a bill.

- **Primary:** trial starts, with a **30-day click and 3-day engaged-view**
  conversion window. Engaged view means 10 seconds or more.
- **Secondary:** free account creations, comparison-page visits.
- **The honest caveat:** at $10 to $25 a day, YouTube's contribution is mostly
  assisted rather than last-click. Check the **assisted conversions** report in
  GA4 before judging it, and give it 30 days before judging it at all.

Brand lift studies need a spend level far above this budget. Do not go looking
for one.
