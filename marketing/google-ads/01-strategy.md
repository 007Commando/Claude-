# Apex paid programme: Google Search and YouTube

Everything in this folder is built to be imported, not admired. The CSVs in
`import/` load into Google Ads Editor; the docs explain the decisions behind
them so they can be argued with.

Every campaign, ad group, keyword and ad ships **paused**. Nothing spends until
the tracking in `05-tracking.md` is live and verified.

---

## 1. The blocker to clear first

**There is no Google tag on www.apexapplications.io.** `src/app/layout.tsx`
loads the Meta pixel, the OpenAI pixel and the GHL tracker. It loads no gtag.js,
no GA4, no Google Ads conversion tag.

That means, as of today:

- Google Ads cannot count a single conversion.
- No remarketing list can be built, so half the YouTube plan has nothing to
  target.
- Smart Bidding is unavailable, because it has nothing to bid toward.

Running conquest campaigns without this is paying competitor-level CPCs to
learn nothing. `05-tracking.md` covers what was built for it and the part
only Stefano can do: create the Google Ads account, create the conversion
actions and paste six variables into Vercel. No further code change is needed,
because every call site is already written and no-ops until its label exists.

---

## 2. What we are actually selling, and to whom

Grounded in `src/config/offer.ts` rather than memory:

| Fact | Value |
| --- | --- |
| Starter | $149/mo |
| Pro | $299/mo |
| Annual discount | 20% |
| Trial | 7 days free, **card collected up front, not charged** |
| Repricer | included in every paid plan, Starter included |
| On sign up | 3 vetted US wholesale distributors, 3 more every month |

Two copy rules follow and both are already enforced by `build.py`:

1. Never write "no card required". The accurate phrasing is "nothing charged
   for seven days", and that is what every ad says.
2. If `NEW_PRICING_LIVE` flips to `true` in `src/config/offer.ts`, Starter
   becomes $69 with a $1 five-day paid trial. **Every headline quoting $149
   becomes a policy violation that day** (Google requires the ad price to match
   the landing page). The change is one constant in `build.py`; rerun it and
   reupload the ads the same hour the flag flips.

The buyer is an Amazon **wholesale** seller, not a private-label seller and not
a retail-arbitrage hobbyist. That distinction is why the negative lists exclude
private label, dropshipping, liquidation pallets and Alibaba: those searchers
look identical in a keyword tool and never buy this product.

---

## 3. Budget and the maths behind it

### Phase 1: $100/day, about $3,000/month

| Campaign | Daily | Why |
| --- | --- | --- |
| S01 Brand Defence | $5 | Cheap insurance. Rivals will bid on "apex applications" the week we start bidding on theirs. |
| S02 Conquest, Repricers | $12 | Aura and SellerSnap are the sharpest switch stories we have. |
| S03 Conquest, Sourcing & Ops | $12 | SellerAmp is the highest-volume name on the list. |
| S04 Conquest, Analytics | $11 | sellerboard and SmartScout have the most searchers but the weakest switch logic. |
| S05 Category, Repricing | $14 | Highest intent non-brand set, and the highest CPCs. |
| S06 Category, Wholesale Scanning | $12 | The closest match to what Apex actually is. |
| S07 Category, Profit & Analytics | $9 | Crowded. Watch for bookkeeping drift. |
| S08 Category, Suppliers & Ungating | $10 | Top of funnel. Judged on free signups, not trials. |
| S10 DSA, Comparisons & Blog | $5 | A query miner. Its job is to tell us what to add to the other eight. |
| **YouTube (see `03-youtube.md`)** | **$10** | Starts at a trickle until remarketing lists have a population. |

### Target CPA

The honest version, with every assumption labelled rather than buried:

- **Known** (from the marketing dashboard rebuild): the Facebook funnel ran
  1,168 contacts into 108 Apex signups and 9 paying. PrimeWell ran 2,061 into
  220 signups and 4 paying.
- **Assumption A:** search intent converts better than a lead-magnet funnel.
  A person typing "sellerboard alternative" is shopping; a person who filled in
  a Facebook form is not.
- **Assumption B:** a card-first trial converts to paid at 35 to 50%. The
  checkout collects a card before the trial starts, which is the whole reason
  the funnel was inverted in September.
- **Assumption C:** allowable CAC is two months of Starter, about $300.

That gives an opening **target of $100 per trial start**, which at 40%
trial-to-paid is a $250 CAC. Start there, and hold it: if the account cannot
buy trials at $100 after 300 clicks in a campaign, the answer is a better
landing page, not a higher bid.

None of this is a forecast. It is a stop-loss with arithmetic attached.

### Scaling

Do not raise budgets on a good week. Raise them when a campaign has spent
**3x its target CPA with no conversion** (kill or fix) or has held target CPA
across **15 conversions** (raise 20%, wait a week, repeat).

---

## 4. Bidding, in two phases

**Phase 1, weeks 1 to 4: Manual CPC.** Not because it performs better, but
because Smart Bidding on an account with no conversion history will spend the
whole budget on the most expensive query it can find while it "learns". Manual
CPC with the opening bids in `03-keywords.csv` buys a readable search terms
report instead.

**Phase 2, from about 30 conversions in a 30-day window: Maximise conversions
with a target CPA**, applied per campaign, never account-wide. Conquest and
category have different economics and must not share a bid strategy.

Bid on **Trial Started**, not on **Paid Customer**. Paid customers arrive at
roughly 1 to 3 a week; a bid strategy fed at that rate never leaves learning.
Paid customers are still imported (section 6) so the value of a trial can be
measured, they just are not the optimisation target.

---

## 5. The trademark constraint, which is not optional

Google's policy splits into two halves and people routinely conflate them:

- **Keywords:** bidding on a competitor's trademark is allowed. Google does not
  accept trademark complaints about keyword selection in the US. `S02` to `S04`
  are legitimate.
- **Ad text:** using a competitor's trademark in a headline or description is
  **not** allowed, and a complaint can be filed against the account, not just
  the ad.

So every conquest ad in `05-responsive-search-ads.csv` is written without
naming anyone, and `build.py` fails the build if a rival's name creeps into
conquest copy. The differentiation lives on the other side of the click: every
conquest ad group points at that rival's own page under `/compare/`, which is
allowed to name them and does.

Two consequences that are easy to get wrong:

1. **Never enable Dynamic Keyword Insertion in a conquest ad group.** DKI would
   print the trademark into the headline automatically, which is the violation
   we just spent a section avoiding.
2. The **informational-site exception** could eventually allow the rival's name
   in ad text, since `/compare/<rival>` genuinely is informational. It has to be
   granted through a trademark authorisation request before it is relied on.
   Worth filing after the account has a clean history. Not on day one.

Keepa is deliberately **not** in the conquest list. Apex blends Keepa's model
into its own sales estimates, so attacking it in ads would contradict the
product.

---

## 6. Measurement

### Conversion actions to create

| Action | Category | Counts | Value | Primary |
| --- | --- | --- | --- | --- |
| Trial Started | Start trial | One | $250 | **Yes, this is the bid target** |
| Free Account Created | Sign up | One | $15 | No, observe only |
| Checkout Started | Begin checkout | One | $25 | No, observe only |
| Booking Started | Contact | One | $40 | No, observe only |
| Paid Customer | Purchase | One | actual first invoice | No, imported offline |

Only **Trial Started** is marked primary. Everything else is a secondary
conversion: visible in reports, invisible to the bid strategy. An account that
marks five actions primary is an account whose target CPA means nothing.

### Offline import is what makes this honest

Trials are cheap to count and easy to fake yourself into. The number that
matters is the paid customer 7 to 37 days later, and the only way Google ever
sees it is the Google click ID captured at signup and imported back when Stripe
charges the first invoice. That plumbing is in `05-tracking.md`.

Until it runs, every "cost per acquisition" in the Google interface is a cost
per trial wearing a different name.

### Weekly review, 30 minutes

1. Search terms report, every campaign, 7 days. Add negatives. This is the whole
   job in month one.
2. Any conquest ad group with spend and zero clicks to `/compare/` scroll depth:
   the landing page is losing the argument, not the ad.
3. Impression share lost to rank vs budget, on brand only.
4. Trial starts by campaign against the $100 target.

---

## 7. Rollout

**Week 0, blocked on Stefano:** create the Google Ads account, link GA4, paste
the two IDs (`05-tracking.md`), verify a test conversion fires.

**Week 1:** unpause S01 brand, S05 and S06 category. These are the two
campaigns whose queries we understand best. Learn the CPC reality before
spending conquest money.

**Week 2:** unpause S02, S03, S04 conquest and S10 DSA. Build the first
remarketing lists from week 1 traffic.

**Week 3:** unpause YouTube Y01 and Y02 once the remarketing lists have a
population, plus Y04 remarketing.

**Week 6:** first bid-strategy switch on whichever campaign crossed 30
conversions. Demand Gen (Y05) only after a converter list exists for a
lookalike seed.

**Not in the plan, deliberately:** Performance Max. On an account with no
conversion history it will eat the brand campaign, report the resulting brand
traffic as its own success, and give no search terms report to check it with.
Revisit at month three with brand exclusions applied, or not at all.

---

## 8. Files

| File | What it is |
| --- | --- |
| `build.py` | Generates and validates every CSV. Edit this, not the CSVs. |
| `import/01-campaigns.csv` … `10-…` | Google Ads Editor import files |
| `02-search-campaigns.md` | Campaign by campaign, why each keyword set exists |
| `03-youtube.md` | YouTube and Demand Gen structure, audiences, placements |
| `04-video-scripts.md` | Seventeen scripts, shot by shot, with the text assets |
| `05-tracking.md` | Conversion tracking: what was built, what is left |
