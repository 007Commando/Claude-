# Apex marketing site: factual accuracy claims inventory

Audit date: 2026-10-07. Read-only pass over the working copy at `seo-site` (scratchpad). Report generated 13:28 ET.

Line numbers are for the files as they stood at generation time. Paths are relative to the repo root (`.../scratchpad/seo-site`).

## Read this first

- **The repo was being edited by another session while I audited.** Every file below has a modification time after the 12:37 baseline, i.e. it changed during or after my read. Findings are re-resolved against the current text at generation time; any quoted phrase that no longer exists is under "Already fixed" at the bottom. Re-run the check on these before acting:
  `src/config/offer.ts` (12:49); `src/components/agent/ArchitectureDiagram.tsx` (12:58); `src/app/ai/page.tsx` (13:08); `src/components/AgentInfrastructure.tsx` (13:08); `src/components/IntegrationGuide.tsx` (13:09); `src/app/integrations/claude/page.tsx` (13:10); `src/app/integrations/chatgpt/page.tsx` (13:11); `src/data/mcpTools.json` (13:11); `src/components/SuiteMap.tsx` (13:15); `src/config/features.ts` (13:15); `src/config/product.ts` (13:15); `src/components/GoogleTag.tsx` (13:17); `src/app/layout.tsx` (13:19); `src/app/pricing/page.tsx` (13:19); `src/app/sitemap.ts` (13:19); `src/app/about/page.tsx` (13:23); `src/components/LazyVideo.tsx` (13:24); `src/components/Footer.tsx` (13:25); `src/components/LandingPage.tsx` (13:25); `src/components/PickPlan.tsx` (13:26); `src/app/docs/mcp/page.tsx` (13:28); `src/app/llms.txt/route.ts` (13:28); `src/components/Navigation.tsx` (13:28)
- Everything else was untouched since the 12:37 baseline copy.
- Category tags: STAT = numeric claim with no source; PRICE = price, plan, trial or entitlement contradiction; STATUS = feature status (beta, live, planned); OVER = overpromise; POLICY = Amazon rule stated as universal; EVID = customer evidence or endorsement lacking a source.
- Where a claim repeats across many files I list it once, with all hit lines.

## Counts (open findings)

| Category | Findings |
|---|---|
| 1. Numeric / statistical claims with no source | 26 |
| 2. Price, plan, trial, entitlement contradictions | 30 |
| 3. Feature-status contradictions (beta, live, planned) | 21 |
| 4. Overpromising | 36 |
| 5. Amazon policy stated as universal | 9 |
| 6. Customer evidence, endorsements, internal claims needing a source | 27 |
| **Total** | **149** |

## Highest-impact items (fix first)

1. **Comparison pages say Starter ($149) is 'the whole suite' with the repricer.** `src/data/comparisons.ts` (10 pages), `CompareHelium10/JungleScout/SmartScout/SellerSnap.tsx`, `CompareShared.tsx`. Starter has no repricer; Pro $299 does. Direct contradiction of product truth on 14 indexed pages.
2. **Review Booster described as generating positive reviews, winning the Buy Box, or free for life.** `ReviewBooster.tsx`, `app/review-booster/page.tsx`, `ApexBlack.tsx` (custom messaging), `FbaStarterBundle.tsx`, `ApexElite.tsx`, 4 blog posts. Policy risk as well as accuracy.
3. **The 70 percent ungating rejection rate.** Five places in three blog posts including a meta description and a stat card. No source exists.
4. **Red presented as available.** Plan table in `PickPlan.tsx`, ApexElite, PremiumMembership, ApexPop suite block, HowApexWorks, `BlogCta.tsx`, eight blog posts.
5. **Prep-centre network: 'Apex Approved Partner' and '30% off lifetime prepping' versus 'Apex is not a formal partner'.** `PrepCenterNetwork.tsx` contradicts itself; `/amazon-fba-prep-centers` says Apex does not endorse providers.
6. **Customer evidence.** `ZeroToHero.tsx` '2,400+ customers' with stars, Trustpilot score 4.0 vs four 5-star reviews, brand wall on GroceryCommerce, 'Apex Approved Partner'.
7. **Plus ($199) is sold but hidden.** Absent from the pricing table, schema, homepage cards and compare footer while the homepage FAQ, the quiz and the funnels name it.

## Findings by file

### `src/lib/blog.ts`
- L76, L81 [STAT] "Roughly 42 percent of wholesale sellers report getting their business off the ground in under six weeks" (start-amazon-wholesale); stat card "6 weeks, typical time to launch" -> Survey-style statistic with no survey, source or date. -> REMOVE; say 'many sellers take weeks to get a first order out'.
- L82, L83, L181, L182, L1149, L1150 (+5 more) [STAT] Margin benchmark cards and tables: "10 to 20% typical wholesale net margin", "30%+ gross margin target", "15 to 25% net good", "<8% warning" (start-amazon-wholesale, wholesale-profit-margins, wholesale-vs-private-label, online-arbitrage); private label "20 to 35%", arbitrage "10 to 20%" -> Industry benchmarks with no source, labelled 'Real benchmarks' in the post's meta description. Also conflict: FbaCalculator says 15% margin / 30% ROI is healthy. -> Label as 'rules of thumb we use' with the method, or REMOVE the 'real benchmarks' wording.
- L123, L427, L1688, L2061, L2617, L2787 (+1 more) [EVID] "every new account gets 3 free, vetted, authorized US wholesale distributors" (7 posts, each with a /auth?plan=starter link) -> 'Vetted' and 'authorized' with no stated standard; also 'every new account' versus the Vault page (Annual only). -> Say what vetting means, or use 'authorized US distributors (3 at signup)'.
- L175, L1770, L1967, L1997, L2005, L2803 [STAT] Share of sale price taken by Amazon fees stated as five different ranges: 15-25%, 20-35%, 25-40%, 30-40% (twice), 35-40% -> Same quantity quoted with different ranges across start-amazon-wholesale, challenges-of-amazon-wholesale and amazon-fba-fees-explained (3 times). At least some are wrong for a given product; none is sourced. -> Show one worked example (as the fees post does at L1948-1952: 38-39%) and cite 'varies by product'.
- L197, L327, L334, L345, L2795 [STAT] "Amazon rejects roughly 70 percent of first time DIY ungating attempts over invoice formatting issues alone" (5 places in 3 posts: start-amazon-wholesale, amazon-ungating-guide meta/intro/stat card, challenges-of-amazon-wholesale) -> The audit's flagship example. Amazon publishes no ungating rejection rate; the cause ('invoice formatting alone') is also asserted as fact. This also sits in the post's meta description and a stat card. It is the single most repeated unsourced statistic on the site. -> REMOVE the number everywhere. Use: 'Invoice problems are a common reason applications are rejected.'
- L197, L475 [POLICY] "Many applications with a clean, correctly formatted invoice are approved within minutes to a few hours." -> Approval-time claim, not Amazon-published, varies widely. -> 'Timing varies, from minutes to days or longer'.
- L223, L1092 [EVID] "Apex members get member pricing across a vetted network of US prep centers" -> Contradicted by the Network page footer ('not a formal partner'). -> Align with the Network page.
- L267, L1484, L1595, L1675, L2735, L2863 (+3 more) [STATUS] "Apex Black, Blue, Green, and Red" (8 posts: wholesale-vs-private-label, cost-of-seller-software, why-apex-applications, why-wholesale-wins-long-term, challenges-of-amazon-wholesale, everything-apex-gives-you, prevent-amazon-suspension, seven-figure-wholesale-sellers; start-amazon-wholesale uses the linked variant) -> Four-module framing. Gold (the repricer) never appears anywhere in the blog, and Red is described as live with no beta or invitation note. 'One suite instead of five' is also stale (five modules). -> Mention five modules and mark Red and Gold as beta; or link to /features instead of listing.
- L267, L273, L1585, L1680, L1737, L2971 [STAT] "$300 playbook library" / "10 tactical playbooks worth $300" / "a 300 dollar value" -> Dollar value with no basis (the playbooks have no list price). -> REMOVE the dollar value.
- L346, L347, L386, L408, L409 [POLICY] "10 units: Minimum quantity most invoices need to show"; "90 to 180 days: Invoice must typically fall within this window" -> Stated as how Amazon reviewers behave. Requirements vary by category, brand and account, and change. The UngatingGuide page says 180 days; the blog says 90 to 180. Internal conflict. -> 'Amazon has commonly asked for around 10 units on an invoice dated within the last 90 to 180 days; your application states the exact figures.' Use one version.
- L784, L788, L2831 [STATUS] "Real time visibility into current inventory across every prep center and warehouse is exactly what Apex Red's inventory tools are built to give you" (purchase-order-workflow, challenges-of-amazon-wholesale captions and body) -> Red is beta and invite-only; inventory is a synced view, not real time. -> 'A synced view of inventory across your prep centers and warehouses (Apex Red, beta)'.
- L877, L931 [STAT] "A seller who manually remembers to request reviews maybe 60 percent of the time is leaving 40 percent of their potential social proof on the table"; "pull ahead ... within the first two months" -> Invented percentages and an uplift claim in a review-automation post. -> REMOVE both.
- L923, L2935 [OVER] "Review Booster runs neutral, compliant review requests automatically on every order, timed for the highest response rate" (everything-apex); "a request timed a few days after estimated delivery ... performs best" (automate-review-requests) -> The seller sets the wait; Apex does not optimise it. 'Every order' should be 'every eligible Amazon.com order'. -> 'after the wait you set'.
- L951, L1584, L1708, L2941 [PRICE] "Review Booster, free for life on every plan"; "$0 Cost of Review Booster, free for life"; table "Included free for life, Apex Black" -> Not the offer: Review Booster is free to switch on until Oct 31 2026 and otherwise needs a plan or trial. Appears in 4 posts: automate-review-requests, cost-of-seller-software, why-apex-applications, everything-apex-gives-you. -> 'Included with every plan. Free to switch on until October 31, 2026.'
- L967 [POLICY] FAQ: "Is it legal to automate Amazon review requests? Yes, provided ..." -> A legal/policy yes. Amazon permits Request a Review via its API; selective use is what breaks policy. The answer is mostly sound but 'legal' should be 'allowed under Amazon policy'. -> 'Amazon allows it through its Request a Review feature, provided ...'.
- L1546 [PRICE] costChart "Apex Starter" price 150 "Sourcing, PO management, financial analytics, logistics, prep network, free lifetime Review Booster, 3 free suppliers" -> Starter is $149. The note lists logistics and a prep network (Red, beta/invite-only) as included. The $106 vs $150 chart implies Starter replaces InventoryLab-type tools. -> $149; note 'Black, Blue, Green; Red by invitation'.
- L1582, L1583 [STATUS] Table rows: "Inventory and restock alerts ... Included, Apex Red"; "Prep center coordination and network pricing ... Included, Apex Red" -> Restock alerts are in Apex Blue (Analytics), not Red. Red is beta and invite-only. -> Name Apex Blue for restock; mark Red beta.
- L1753, L2999, L3015 [PRICE] "The 7 day free trial gives full access to the plan you selected, Starter or Pro"; "Pro includes higher usage limits and additional seats compared to Starter"; "either the Starter Plan or the Pro Plan" -> Omits Beginner and Plus. The Starter vs Pro difference omits the repricer (Pro only), AI drafts (Pro) and the sales ceiling. 'Full access' to the plan selected still excludes features outside it. -> Use the pricing page FAQ text (generated from config).
- L1770, L1879 [POLICY] Fee posts: tiered referral table (L1806-1820), "3.5% fuel and logistics surcharge since April 17, 2026", peak window "January 15 to October 14, 2026" -> Amazon fee schedules change at least annually. Posted as universal 2026 facts with no 'as of' link. Not wrong per se, but must be re-verified against Amazon's current page before each deploy. -> Add the source link and the review date internally; avoid hard-coding per-category tables.
- L2141, L2233, L2763 [STAT] "The overwhelming majority of wholesale suspensions trace back to one root cause"; "sellers who scale past their first year almost always have three to six active supplier relationships"; "typically happens within the first three to six months" -> Unsourced prevalence and timing claims. -> Soften to 'a common cause'; REMOVE counts.
- L2979, L3003, L3341, L3353, L3357, L3396 (+1 more) [EVID] "white glove onboarding, roughly 160 minutes of Amazon education ... and direct access to a dedicated account manager" (everything-apex-gives-you, amazon-seller-community) -> Service promise on every account with no limit stated; identical to Auth benefits. If it is a support inbox, the word 'dedicated' misleads. -> Describe the real support entitlement per plan.
- L2979, L3357 [STAT] "roughly 160 minutes of Amazon education" -> Specific content-length claim; verify against the University. -> Verify or REMOVE.

### `src/data/comparisons.ts`
- L68, L70 [STATUS] APEX_PRO_BAR "Apex Pro (whole suite)" / "Every module" -> Pro does include the repricer, but 'every module' includes Red (beta, invite-only for sellers) and Gold is beta. -> 'Repricer on every listing (beta). Red by invitation.'
- L75, L77 [PRICE] APEX_BAR: "Apex Starter (whole suite)", price: 149, caption "Every module. ..." -> FALSE. Starter has no repricer and Red is beta/invite-only. Used as the Apex bar on 9 comparison pages (selleramp, seller-assistant, scan-unlimited, rocket-source, inventorylab, boxem, 2d-workflow, third-party-profits, tactical-arbitrage). Price is hard-coded 149, not read from config. -> Label 'Apex Starter', caption 'No repricer. Red in beta.', price from planById('starter'). Show Beginner $49.99 where it is the true entry price.
- L123, L124, L178, L179, L180, L233 (+18 more) [OVER] Competitor cells hard-set to false (Aura, BQool, Informed, Repricer.com, SellerAmp, Scan Unlimited, Rocket Source, Boxem, 2D Workflow, Third-Party Profits, Tactical Arbitrage) -> The file's own rule is that an unverified competitor capability is 'Not verified', never false. 24 cells are false (purchase orders, P&L, repricing, catalog scanning) assert absence in a rival product. Risk if wrong. -> Use 'Not verified' unless the rival's page was checked, and cite the page.
- L229 [PRICE] Informed Repricer page: "Published listing limits" Apex: "None" -> FALSE. Monitored listings cap at 500 / 1,000 / 2,000 / 4,000 by plan; Starter also has a $10K/mo sales ceiling. The page's own APEX_TIER_LIMITS says so two rows earlier in the file. -> Use APEX_TIER_LIMITS here.
- L336, L389, L446, L499, L552, L600 (+4 more) [PRICE] "$149/mo for the whole suite" (Entry price row) -> FALSE on 10 comparison pages. $149 is Starter, which excludes the repricer. Entry price is Beginner $49.99; the plan with the repricer is Pro $299. -> "Beginner $49.99/mo, Starter $149/mo, Pro $299/mo (repricer on Pro)".
- L339, L392 [STATUS] Browser extension: "Free for Apex University graduates" (selleramp, seller-assistant) -> The Apex Chrome extension is live on the Chrome Web Store and linked from the footer; hand-built pages (Helium 10, Jungle Scout, SmartScout) say Apex has no Chrome extension. Three different answers on the same site. -> One answer everywhere: 'Apex for Amazon Sellers, Chrome Web Store'. State any graduate gating accurately.
- L447, L500 [PRICE] "7-day trial of everything" (scan-unlimited, rocket-source Free tier row) -> 'Everything' is wrong: trial covers the plan you pick; Red is invite-only. -> "7-day free trial of the plan you pick, card required".
- L562 [EVID] sellerboard: "theirs is deep, mature and well regarded" -> Unsourced praise of a competitor. -> REMOVE or cite a source.
- L619, L675 [STATUS] boxem: "Sourcing, buying and repricing ... those modules are live"; inventorylab: "...those are not in beta here" -> Repricing is beta (Gold page, homepage map, features.ts). -> Say sourcing and buying are live and repricing is in beta.

### `src/components/CompareShared.tsx`
- L100 [PRICE] CTA heading "Try the whole suite free" (on every comparison page) -> Trial plan is chosen at signup; Starter has no repricer and Red is beta/invite-only, so 'whole suite' is not what a trial on the entry plan gives. -> 'Start a 7-day trial' (card required, nothing charged until day 8).
- L108 [PRICE] "Beginner $49.99/mo · Starter $149/mo · Pro $299/mo · repricer on Pro" -> Hard-coded; omits Plus ($199/mo). -> Build from planById() and include Plus, or say 'Plus available'.
- L175 [STATUS] Workflow chart marks Price as "full" for every comparison -> Gold is beta; Red is correctly downgraded via isBeta but Gold is not shown as beta here. -> Use isBeta('gold') the same way as Red.

### `src/components/CompareIndex.tsx`
- L121 [STAT] "connect your store and see your own numbers inside Apex in fifteen minutes" -> Setup-time claim, unsourced. -> 'Connect your store and see your own numbers'.

### `src/components/CompareHelium10.tsx`
- L46, L57 [PRICE] "Apex Starter, whole suite" $149 "Wholesale research + POs + repricer + P&L"; repricer row ticked -> FALSE for Starter (no repricer). -> Use Pro $299 for the repricer comparison, or say 'repricer on Pro'.
- L50 [STATUS] Chrome extension: Apex false (also CompareJungleScout, CompareSmartScout) -> Apex for Amazon Sellers is live on the Chrome Web Store (footer links it). -> Update to true with the store link.
- L78 [OVER] "you're Helium 10's edge case, and our entire roadmap" -> Roadmap claim; puffery. -> REMOVE.

### `src/components/CompareJungleScout.tsx`
- L46, L59 [PRICE] "Apex Starter, whole suite" caption "Research + POs + repricer + P&L"; "Automated repricer: Included, break-even floors" -> FALSE for Starter. -> Pro $299 for repricer, or 'Pro plan'.
- L79 [STAT] "Apex helps you run five hundred that already exist" -> Implied capacity number; no basis (and Starter caps monitored listings at 1,000). -> 'run the products that already exist'.

### `src/components/CompareSmartScout.tsx`
- L44, L57, L62 [PRICE] "What the $149 actually opens: the whole operating suite, not a research tab."; repricer "Included" in Starter column -> FALSE. $149 Starter does not open the repricer. -> 'What Pro ($299) opens'. Or show the repricer as a Pro feature.

### `src/components/CompareSellerSnap.tsx`
- L41, L59, L77 [PRICE] "$149/mo, whole suite"; "You'd rather pay $149 for a whole suite than a comparable amount for repricing alone" -> FALSE. A repricer comparison must use Pro $299 (Seller Snap entry is $100). -> Compare Seller Snap with Apex Pro $299.

### `src/components/ApexBlack.tsx`
- L110, L113 [STATUS] "Inventory aging alerts before storage fees hit"; dashboard shows "pending shipments" -> Unverified feature claim; 'pending shipments' comes from Apex Red, which is beta and invite-only. -> Verify against the app or REMOVE. Say 'inventory value and sales velocity'.
- L133, L135 [OVER] "Real-time feedback monitoring & alerts", "Intelligent post-delivery review sequencing" -> Review Booster sends requests and keeps a log. It does not monitor feedback in real time, and Amazon provides no delivery dates (wait = order date + 3 days + the wait you set). -> 'A log of every request sent' and 'Requests sent a set number of days after the order'.
- L134 [OVER] "Custom messaging tailored to your brand voice" -> False. Review Booster sends Amazon's own standardized Request a Review; there is no custom copy (the site's own /amazon-review-automation says so). -> REMOVE. Replace with 'Amazon's own review request, sent on a schedule you set'.
- L185, L188, L190 [EVID] "featuring only the vendors we actually use and trust"; FX partners with member discounts -> Endorsement and discount claims with no named partners or terms. -> Name the partners and terms, or write 'a directory of service providers'.

### `src/components/ApexBlue.tsx`
- L50 [STATUS] Hero badge "Enterprise Logistics" -> Blue is purchasing and analytics. Logistics is Apex Red (beta). 'Enterprise' also suggests the unsold Enterprise plan. -> 'Purchasing and profit'.
- L204, L210 [OVER] "generate precise buy recommendations", "days-until-next-order forecasting" -> Contradicts /amazon-inventory-management-software, which says restock is assumption-based, not predictive, with no forecast. -> 'Restock suggestions from your target cover, lead times and current stock'.
- L245 [OVER] "Global supplier profiles across US, UK, and EU markets" -> Plans allow 1 or 2 marketplaces and the prep-centre FAQ says 'Amazon US today'. Implies UK/EU support. -> 'Supplier profiles with contacts, terms and lead times'.
- L246, L248 [OVER] "Auto-calculated vendor reliability and lead-time scores", "Performance alerts when vendors miss fulfillment targets" -> Unverified. Vendors page shows stated vs actual lead time; no scoring or alerts are documented in How Apex Works. -> Verify or REMOVE.
- L266 [PRICE] "Buy Box price and 30, 60 and 90-day sold averages, refreshed every few minutes" -> 30/60/90 day Buy Box averages are Plus and Pro only (off on Beginner and Starter), and the 'every few minutes' refresh claim has no stated source. -> Add 'on Plus and Pro' and drop the refresh interval unless verified.
- L285 [OVER] "see exact revenue, expenses, and profit before you ever spend a dollar" -> Projections are arithmetic on entered costs and prices, not exact (How Apex Works and the Pop pages say so). -> 'see projected revenue, expenses and profit from your own numbers'.

### `src/components/ApexGreen.tsx`
- L111 [STAT] "Scan up to 100,000 UPCs per hour" -> Speed claim with no methodology. Repeated on /features/green meta, UngatingGuide, amazon-wholesale-software. Also sits beside monthly caps of 20,000 (Beginner) and 60,000 (Starter) SKUs. -> REMOVE the number, or state the test conditions and date. Say 'works through the whole file in the background'.
- L114 [OVER] "Competition counts and Buy Box eligibility at a glance" -> Apex cannot know Buy Box eligibility for a seller; it shows offers and who holds the Buy Box. -> 'Seller counts and who holds the Buy Box'.
- L133, L134 [OVER] "Automatic stock-level reconciliation across feeds", "Smart lead tagging and duplicate detection" -> Unverified features (Master Catalog merges price lists; no stock reconciliation is documented). -> Verify against the app or REMOVE.
- L158 [EVID] "Join the elite sellers who have moved from spreadsheets to systems" -> Implies a customer base of 'elite sellers' with no data. -> 'Start with a supplier price list you already have'.

### `src/components/ApexGold.tsx`
- L154 [OVER] RepriceRow sample SKUs with "Buy Box" tags -> Sample rows styled as live listings, unlabelled on page. -> Add an 'Example' caption.
- L184, L259, L262 [OVER] "Live activity" panel: "Raised B006IF to $26.15; competitor left the Buy Box", "Dry-run: 214 moves previewed, 0 floors crossed"; "Applied to 10 SKUs in one action" -> Invented activity log with relative timestamps ('2m ago') under a 'Live activity' heading, no on-page 'example' label. The comment at RepriceRow admits it is concept art. Also reads like real Buy Box outcomes. -> Label 'Example, not real data' or replace with a real screenshot.
- L290 [PRICE] "Part of Apex Pro, not sold as a separate subscription, and Beginner can try it on one listing." -> Omits Plus (5 listings). Accurate otherwise. -> 'Included in Pro. Beginner can try it on 1 listing and Plus on 5.'

### `src/components/ApexRed.tsx`
- L20 [STATUS] Visible "Scope checked 14 September 2026" -> Date stamp on a customer-facing page (house rule is no 'as of' stamps). The page is otherwise accurate: beta, not-in-beta list, no card. -> Remove the visible date; keep the code comment. Add 'by invitation' to match the invite-only model.
- L137 [STATUS] "Sourcing, purchasing and profit reporting are live on every plan, and repricing is live on Pro." -> Calls repricing 'live' while /features/gold and the homepage map label Gold as beta. -> '...and repricing is in beta on Pro'.

### `src/components/LandingPage.tsx`
- L89 [PRICE] "Plus can try it on 5 listings and Beginner on 1; Starter does not include it." -> Correct, but Plus is not priced or shown anywhere on the homepage plan cards (PLANS_SHOWN excludes it). Visitor cannot place the plan. -> Show Plus ($199/mo) or drop the mention.
- L168, L195 [STAT] "Most wholesale sellers keep each of these steps in a different tool or tab."; "sorted in minutes" -> Unsourced 'most' and an unqualified speed claim. Low risk. -> 'Many'; remove 'in minutes' or state file size.

### `src/components/ReviewBooster.tsx`
- L19, L55 [OVER] "helps you effortlessly collect more positive reviews"; "maximizing your positive feedback" -> Review language implying generated or positive reviews. The tool sends Amazon's neutral request to eligible orders and cannot choose or influence reviewers. Conflicts with /amazon-review-automation. Policy risk (selective positive solicitation). -> 'Sends Amazon's own review request on every eligible order, so you stop forgetting to ask'.
- L19, L123 [OVER] "ensuring every order gets a timely review request"; "at the optimal time" -> Only eligible Amazon.com orders get a request; timing is a wait the seller sets, not an optimized time. -> 'on every eligible Amazon.com order, after the wait you choose'.
- L23, L24 [OVER] "Win More Buy Box Placements ... increasing your chances of being featured in the Buy Box. More visibility = more sales!" -> Implies Review Booster raises feedback score and wins the Buy Box. No guarantee and no evidence; Gold page itself says nobody can promise the Buy Box. -> REMOVE the Buy Box benefit card.
- L29, L34 [OVER] "customers are more willing to buy from you, even at slightly higher prices"; "an undeniable edge" -> Causal pricing and competitive-edge claims, unsourced. -> REMOVE.
- L55, L90, L93 [PRICE] "Our Free Review Automation Tool", "Start Using It for Free Today!", "Get Started for Free" -> Review Booster is free to switch on only until Oct 31 2026 (promo); afterwards it needs a plan or trial. No end date is stated. -> 'Free to switch on until October 31, 2026. After that it needs a plan or trial.'

### `src/components/UngatingGuide.tsx`
- L35 [POLICY] "Dated within the last 180 days" -> Presented as Amazon's rule. Invoice age and quantity requirements vary by category and brand and change; the blog says '90 to 180 days'. Internal conflict. -> 'Recent, often within 180 days, but check the window your application states'.
- L39 [POLICY] "Pricing on the invoice is optional; you can leave it off" -> Stated as universal. Some categories/brands require pricing or specific line detail. -> 'Some applications accept invoices with pricing removed; confirm for yours'.
- L69, L74 [POLICY] "Mismatches are the #1 reason ungating requests get rejected"; photos always required -> Unsourced ranking claim; photo requirement varies by category/brand. -> 'A common reason requests are rejected'; 'many applications also ask for product photos'.
- L123 [POLICY] "repeated identical submissions can count against the account" -> Unverified account-health claim. -> REMOVE or cite Amazon.
- L127, L128, L135, L369 [OVER] "You're Ungated in Grocery"; "You can now source and list in it freely"; "Sign Up & Get Ungated Today" -> Presents approval as the outcome. Approval is not guaranteed (the disclaimer is at the foot), brand gating, hazmat and restricted products still apply, and 'freely' is wrong. -> 'If approved, you can list in Grocery. Individual brands may still need approval.' Retitle 'Start your application'.
- L136 [EVID] "Three authorized distributors from the Vault are open the day your subscription starts, three more each full month you stay, and an annual plan opens all of them at once." -> Third version of the supplier-access rule (see PickPlan, Vault, amazon-wholesale-software). -> Single source.
- L153, L635 [STAT] "Scan Up to 100,000 UPCs/Hour"; "Everything else you just saw is already built into Apex." -> Same unsourced speed claim; Gold is beta. -> See ApexGreen.
- L345 [STAT] "390 authorized suppliers. 3 open on subscribing, 3 more a month; annual opens all." -> Count is 389 everywhere else (distributorStats.ts, Vault page, Pop pages). Access rule (3 open, +3 a month, annual opens all) also conflicts with the Vault page, which says Annual Members Only. -> Use DISTRIBUTOR_COUNT. Reconcile the access rule across pages.

### `src/components/PickPlan.tsx`
- L86 [PRICE] Listings: Unlimited / Unlimited -> Row says listings are unlimited while the Blue block below caps monitored listings at 500 / 1,000 / 4,000. Two different 'listings' numbers with no explanation. -> Rename to "Listings you can sell" or remove; keep "Listings Monitored" as the only listing limit.
- L140, L141 [STATUS] Apex Red rows ticked on both plans, "Prep Centre Workflows: Unlimited" -> Red is beta and invite-only for sellers, but the plan table shows it as included with ticks and no beta label (the file's comment says it mirrors the app's own plan table, which has the same problem). 'Unlimited' prep centre workflows also contradicts the Blue row 'Prep Centre Connections' (1 / 1 / 3). -> Label the section "Apex Red (beta, by invitation)" and drop "Unlimited", or move Red out of the plan comparison.
- L187, L188 [EVID] FAQ "every trial comes with 3 free authorized US wholesale suppliers" (serialized into FAQPage schema) -> Supplier entitlement stated for every plan and every trial. Conflicts with the Vault page (Annual members only) and with 'three more each full month'. Unclear whether Beginner gets it. -> Define the entitlement once in config/offer.ts and reuse it in all pages and schema.
- L284, L372 [EVID] "Best Seller" on the Annual toggle, "Most Popular" on Pro -> Popularity badges with no data behind them. -> REMOVE, or replace with a factual label such as 'Repricer included'.

### `src/components/HowItWorks.tsx`
- L24 [OVER] "Our proven setup guide is built to maximize your approval odds with wholesale vendors" -> 'Proven' and 'maximize approval odds' with no results data; contradicts the site's own 'nothing in Apex is a guarantee' stance. -> 'A setup guide covering what distributors usually ask for'.
- L119, L230 [OVER] "Everything you just saw is already built into Apex"; "The easiest path to growing a real Amazon FBA wholesale business" -> Step 5 is Gold (beta); 'easiest' is unprovable. Same 'easiest roadmap' sits in app/how-it-works/page.tsx metadata. -> 'The steps below, in order' and drop 'easiest'.

### `src/components/HowApexWorks.tsx`
- L1013, L1256, L1315 [STATUS] Red and Gold sections inside "The five modules" -> No beta or invite-only note anywhere in the file (zero 'beta' strings). Red is beta and invite-only; Gold is beta. The page is noindex, but it is linked from the footer and used as the product guide. -> Add a Beta / by-invitation notice at the top of each of those two sections.
- L1319 [OVER] "never move your price and you lose the Buy Box" -> Absolute statement about Buy Box mechanics. -> 'a price that never moves can fall out of the Buy Box'.

### `src/config/offer.ts`
- L224 [PRICE] PLANS_SHOWN = PLANS.filter(plan !== plus) -> Plus ($199/mo, live in Stripe) is a sold plan but is withheld from the pricing table, the /pricing schema Offers, the homepage plan cards and the compare footer line. Meanwhile the homepage FAQ, the quiz and the $1 week copy all name Plus. A visitor reads 'Plus can try it on 5 listings' with no Plus price anywhere. -> Either add a Plus column ($199/mo, $1,910.40/yr, 2,000 listings, 5 repriced listings) or stop naming Plus outside the $1 week funnel.

### `src/app/llms.txt/route.ts`
- L27 [PRICE] plansLine built from PLANS_SHOWN: "Beginner $49.99/month, Starter $149/month, Pro $299/month" (llms.txt rewritten 13:18) -> Rewritten file is accurate, but it lists only three plans, so Plus ($199) is invisible to AI assistants, and 'Beginner may reprice 1 listing, Starter none' omits Plus's 5. -> Add Plus when PLANS_SHOWN includes it; mention Plus's 5 repriced listings.

### `src/app/features/green/page.tsx`
- L9 [STAT] Meta: "Up to 100,000 UPCs an hour." -> Unsourced speed claim in a search snippet. -> REMOVE.

### `src/app/review-booster/page.tsx`
- L8 [PRICE] Meta: "Apex Black's free-for-life tool that automates order review requests and seller feedback" -> 'Free for life' is not the offer (free promo until Oct 31 2026, then plan or trial required). -> 'Send Amazon's own review request on eligible orders. Free to switch on until October 31, 2026.'

### `src/app/how-it-works/page.tsx`
- L8 [OVER] Meta: "The easiest roadmap to growing a real Amazon FBA wholesale business" -> Superlative. -> 'A roadmap from foundation to scale'.

### `src/app/about/page.tsx`
- L44, L50 [EVID] New /about page (created 13:23): rendered text "[Founder background to confirm.]" and "run by its founder, Stefano ..., and a small team" -> A literal placeholder renders on the public page, and the team description is unconfirmed (the CONFIRM comments say so). Apex-started-as-prep-center-software is also an unsourced company-history claim. -> Do not publish until the founder bio and team line are confirmed; remove the bracketed placeholder.

### `src/app/amazon-wholesale-software/page.tsx`
- L33 [STAT] "Up to 100,000 UPCs an hour, with suppliers merged into one master catalog" -> Unsourced speed claim. -> REMOVE the number.
- L47, L199 [STATUS] Step 3 "Apex Gold" with no tier or beta note; "Try the whole loop free for 7 days." -> Gold is beta and Pro-only; Red step says '(beta)' but not invite-only. 'Whole loop free' overstates the entry-plan trial. -> Add '(beta, Pro plan)' to Gold; 'Red (beta, by invitation)'.
- L85 [PRICE] "The Starter plan is $149 a month and the Pro plan is $299 a month, and both start with a 7-day free trial." -> Omits Beginner $49.99 and Plus $199; no mention that a card is required or that the repricer is Pro only. This FAQ is serialized into FAQPage schema. -> 'Beginner is $49.99, Starter $149, Plus $199 and Pro $299 a month (20% off yearly, Beginner monthly only). Each starts with a 7-day trial; a card is required and nothing is charged until day 8. The repricer is on Pro.'
- L152 [EVID] "Every Apex trial comes with three authorized US distributors from the Distributor Vault, with three more each full month you stay." -> Entitlement stated here, but /distributor-vault says Annual Members Only and /amazon-wholesale-suppliers says 'the exact entitlement is shown in your account'. Three pages, three versions. -> Pick one rule, cite it once, and reuse.

### `src/app/amazon-inventory-management-software/page.tsx`
- L25 [PRICE] "Buy Box and 30, 60 and 90-day average prices on the same row as your landed cost" -> 30/60/90 day averages are Plus and Pro only. -> Add 'on Plus and Pro'.

### `src/app/amazon-review-automation/page.tsx`
- L27, L29, L60 [STATUS] "...the waiting period you set after their delivery date"; FAQ "When does it send?" same -> Amazon gives no FBA delivery dates. The wait is order date + 3 days + the waitDays the seller sets. -> 'a set number of days after the order date'.
- L65 [OVER] "Asking consistently tends to produce more responses than asking occasionally"; "What this guarantees..." -> Mild: unsourced uplift implication and the word 'guarantees'. Page is otherwise the most accurate on the site. Does not mention Amazon.com only or the plan/promo (free until Oct 31 2026). -> Drop 'tends to produce more'; add 'Amazon.com orders only' and the plan/promo line.

### `src/app/amazon-fba-prep-centers/page.tsx`
- L59 [EVID] "we do not rank or endorse providers" -> Contradicts /prep-center-network ('Vetted Prep Partners', 'Apex Approved Partner', 'exclusive pricing sourced through our direct partnerships') and PremiumMembership/Elite copy. That page then says 'Apex is not a formal partner of the prep centers listed'. -> Make the Network page match this one.

### `src/app/amazon-wholesale-suppliers/page.tsx`
- L67 [EVID] "authorized distributor access that grows the longer the subscription runs, and an annual plan opens the full roster immediately" -> Consistent with UngatingGuide, not with the Vault page (Annual only) or PopQualify ('directory of 389+ verified suppliers comes with your software'). -> Align all pages.

### `src/app/watch/page.tsx`
- L16, L25 [STAT] Meta: "a purchase order built from what clears, in under two minutes" -> Time claim, also on ApexPop (noindex pages). -> REMOVE, or caveat with file size.

### `src/app/start/page.tsx`
- L24 [OVER] Meta: "the full Apex software suite, and an AI mentor that builds your first purchase order" -> 'Full suite' (Starter has no repricer); the Mentor answers questions, it does not build the PO. -> 'access to the Apex software and an AI mentor that walks you through your first purchase order'.

### `src/app/apex-elite/page.tsx`
- L8 [EVID] Meta: "a strategy call, an account manager" -> No account manager is described on the page body. Same claim on Auth and in 2 blog posts, never defined. -> Verify and describe, or REMOVE.

### `src/app/fba-starter-bundle/page.tsx`
- L8 [PRICE] Meta: "a free lifetime Review Booster" -> Flag only: bundle perk. Needs the same 'free for life' check as the Elite page. -> Match whatever the product actually grants.

### `src/app/apex-vas/hire/page.tsx`
- L18 [STAT] Meta: "start within one business day" -> Service-level promise; noindex page. -> Verify staffing capacity.

### `src/components/PrepCenterNetwork.tsx`
- L165, L647, L710 [STAT] Time donut 20% vs 80% sourcing time; "You could be paying $8,400 every month ($100,800/yr) running your own warehouse"; "Most centers respond within 24-48 hours" -> Invented illustrations and a response-time claim, presented as realistic figures. -> Label as an illustration with stated assumptions, or REMOVE.
- L260, L273, L418 [EVID] "Apex Approved Partner"; "{n} Vetted Prep Partners"; "exclusive pricing sourced through our direct partnerships" -> Page footer says 'Apex is not a formal partner of the prep centers listed'. One of the two is false. -> Pick one and fix the other; do not use 'approved' or 'direct partnerships' unless contracts exist.
- L492, L505, L512, L519, L530, L539 (+1 more) [STAT] "Save Up to 30% OFF Lifetime Prepping"; market $1.00 to $1.20 vs member $0.60 to $0.70; "$400 to $500 saved per 1,000 units"; "$4,800 to $6,000+ saved over 12 months" -> Specific savings and market-rate numbers with no source, no date, and no per-centre terms. The footer says rates are set by individual centres and 'may qualify you for member pricing'. 'Lifetime, no catch' and 12-month savings imply 12,000 units/yr. Also repeated by blog posts. -> Show each centre's own quoted discount, or REMOVE the aggregate savings.

### `src/components/RewardsBenefits.tsx`
- L24, L33, L42, L62 [OVER] "the best prep centers in the US ... with product insurance built in"; vendors "ready to un-gate you"; "7-figure Amazon sellers"; "No Contracts or Hidden Fees Ever" -> Insurance, ungating promise, seller-tier and fee absolutes with no terms. Vendors cannot ungate anyone; only Amazon approves. -> REMOVE the insurance and ungating wording; 'vendors who sell to Amazon resellers'.

### `src/components/DistributorVault.tsx`
- L63, L228 [EVID] "Annual Members Only"; "{n}+ vetted wholesale distributors ... ready to reach out to today" -> Conflicts with 'three open on day one, three more a month' (Ungating guide, amazon-wholesale-software, Pop pages, PrimeWell form). 'Vetted' has no stated vetting standard. -> One entitlement statement, defined once.

### `src/components/NetworkHub.tsx`
- L35, L40, L41 [OVER] "Real-time net margin", "Automated PO dispatch", "Vetted supplier directory" -> Verify. Elsewhere the seller builds and submits purchase orders (the AI connector can never submit one), so 'automated dispatch' implies Apex sends orders to suppliers. Margin updates on a sync, not in real time. -> 'Net margin from your synced sales', 'Purchase order builder', 'Supplier directory'; drop 'automated dispatch' unless true.

### `src/components/GroceryCommerce.tsx`
- L208, L212, L213 [OVER] "Automatic repricer bidding"; "automated bidding keeps every listing competitive around the clock"; "Apex watches shelf life ... flags what must move before Amazon's expiration windows close" -> The repricer is rule-based and not a bidder, and push repricing is not live. Expiry tracking is unverified. -> 'Rule-based repricing with break-even floors'; verify or REMOVE expiry tracking.
- L264, L313 [EVID] "Trusted to move the brands America restocks daily" over a brand wall (Cheerios, Pampers, M&M's, Red Bull...); "insured, negotiated member rates" -> Implies those brands are customers or trust Apex. Small print says 'no endorsement or affiliation implied', which contradicts the heading. Insurance claim unsupported. -> REMOVE the brand wall or retitle it 'Categories our sellers carry'.

### `src/components/ApexElite.tsx`
- L83, L110, L128 [STAT] Value stack: suppliers $500, VA week $150, suite $450, prep $200, Review Booster $300, playbooks $300; VAs with "9+ years Amazon experience" -> Dollar 'values' have no source; VA page says the team has 'more than 20 years of Amazon experience' (combined). Two different figures. -> REMOVE the value stack or define each value; align the experience claim.
- L87, L88, L92 [STATUS] "Full Apex Suite for 90 Days"; "Apex Black, Blue, Green & Red ... logistics" -> Red is beta and invite-only; the 90 days are billed at the Starter rate, which has no repricer. 'Full suite' is not what is delivered. -> '90 days of the Starter plan (Black, Blue, Green; Red by invitation)'.
- L98, L105 [OVER] "real-time inventory and restock tools"; Review Booster "Autopilot growth ... Win more sales ... Ungate easier ... Earn more trust" -> Review Booster cannot ungate or win sales; inventory is a synced view, not real time. -> REMOVE those four bullets.
- L103, L133, L470 [PRICE] "Free Lifetime Review Booster" / "Review Booster free for life" -> Flag only (bundle perk). Must match what the account grants after the free promo ends Oct 31 2026. -> Verify the entitlement; say 'included with Elite'.
- L141 [PRICE] FAQ: "continues at $149.99/month. The same standard Starter rate" -> Starter is $149/mo (live Price 14900). The same page body uses the config value elsewhere, so the FAQ and body disagree. -> $149/month, from planById('starter').
- L751 [OVER] "The Apex Guarantee ... we stand behind every supplier, tool, and system" -> Open-ended guarantee with no terms (also on PremiumMembership). -> Replace with the actual refund/support terms.

### `src/components/PremiumMembership.tsx`
- L31, L59 [STATUS] "the entire Apex Suite, Apex Black, Blue, Green & Red, for 24 months"; value stack $7,176 -> $7,176 = 24 x $299 (Pro) but the plan is never named; Red is beta/invite-only; Gold not mentioned. -> Name the plan (Pro) and mark Red beta.
- L41 [EVID] "Every vetted wholesale distributor in the Apex Vault ... each with a real website and direct contact email" -> 'Vetted' has no standard; the Vault page says contact emails are reserved for Annual members, while this page sells them as a perk of a $5,999 membership. -> Define vetting; state who gets contact details.
- L47, L53 [OVER] "real-time inventory and restock tools"; discount "stays locked in for as long as you work with them" -> Prep centre rates are set by each centre (see PrepCenterNetwork footer). Lifetime lock-in is not Apex's to promise. -> REMOVE or qualify.

### `src/components/FbaStarterBundle.tsx`
- L36, L85 [PRICE] Trust row "Cancel anytime" on a one-time $29 purchase; "Extended Trial to the Full Apex Suite" -> Nothing to cancel on a one-time payment; 'full suite' lists only Black, Blue and Green in the body. -> 'One payment, no subscription'; 'Extended trial of Black, Blue and Green'.
- L55, L56 [OVER] "Our automated review-generation tool, free for life, so your new listings build social proof from day one" -> 'Review-generation' is false and a policy red flag. Bundle perk flagged for 'free for life'. -> 'Amazon's own review request, sent on eligible orders'.
- L58, L59, L60, L61 [OVER] Review Booster bullets: "Autopilot growth ... Win more sales ... Ungate easier ... Earn more trust" -> Review requests do not ungate or win sales. -> REMOVE.
- L206, L218, L242, L363 [OVER] "What We Promise You"; "The Fastest Path to a Real FBA Business"; "everything you need to land your first profitable deal is included"; "normally take months and hundreds of dollars to assemble" -> Outcome promises and an unsourced cost/time claim. Elsewhere the site says nothing is a guarantee. -> Soften or REMOVE.

### `src/components/CourseLanding.tsx`
- L69, L277 [PRICE] "Create a free Apex account and Apex University opens straight away. The Review Booster and three UPC scans come with it." -> Free account with Review Booster and 3 scans, 'no card'. Review Booster is free only until Oct 31 2026 and Beginner allows 2 scans/month; no free-account entitlement is documented in plan limits. -> Confirm what a no-card account really gets and say 'until October 31, 2026' for Review Booster.
- L120, L156, L288 [PRICE] "Review Booster, free for life" / "Review Booster for life" -> Flag only (bundle perk, paid variant). -> Verify.

### `src/components/ZeroToHero.tsx`
- L277, L278 [STATUS] "The whole Apex suite, free for your trial ... logistics ... Apex Black, Blue and Green" -> Logistics is Red (not named, beta). Gold not included in Starter. -> 'Apex Black, Blue and Green, open for your trial'.
- L404 [EVID] 5 star icons + "loved by 2,400+ customers" -> Unsourced customer count and rating stars. The site's Trustpilot has 4 reviews. Stars imply a rating. -> REMOVE, or replace with the Trustpilot badge from TrustpilotBadge.
- L660 [OVER] "Start now & sell by Christmas." -> Outcome-by-date promise. -> REMOVE.
- L731 [EVID] Badge image "Amazon Selling Partner Appstore software partner" (also Footer, 3 places) -> A third-party credential badge. Needs the listing URL or program evidence on file. -> Keep only if verifiable; link to the Appstore listing.

### `src/components/ApexPop.tsx`
- L218, L220, L221 [EVID] Blurred sample supplier names "Northfield Health Supply", "Brightway Confections", "Coastal Pet Wholesale" -> Invented supplier names shown as 'your first drop'. Blur only hides them visually (they are in the DOM). Perks 'Named contact who approves you' are asserted for suppliers that do not exist. -> Use generic placeholders ('Supplier 1') and no perk claims.
- L324 [STAT] "Start to finish in under two minutes." -> Time claim on a video demo; also in watch/page.tsx meta. -> Say 'In this demo' or remove.
- L579, L610, L622 [STATUS] SUITE "All in one" block lists Red and Gold tools as plain features; Review Booster "Review requests on every order" -> No beta/invite-only for Red, no beta/Pro-only for Gold; Review Booster covers eligible Amazon.com orders only. -> Add beta tags; 'on every eligible order'.

### `src/components/ApexScanFunnel.tsx`
- L31 [STAT] "1,081 of 1,175 products came back profitable" / "92% came back profitable" / "17% median margin" ("one real supplier catalog") -> One anonymous catalog presented as proof. The quiz uses a different 'real scan' (12,203 lines, 2,860 profitable = 23%). The same ads cannot both be the typical case. No source and no date. -> Name the dataset and date in a footnote, or show one range across several catalogs.
- L134, L135, L171 [OVER] "You stop buying products that lose money after fees"; "A whole catalog in minutes"; suppliers "each with the person who approves new resellers" -> Absolute outcome claim; speed claim; and a promise about named approvers at three unnamed distributors. -> Soften; 'tells you which lines are worth buying before you order'.
- L167, L342 [PRICE] "The full Apex suite for 7 days for $1 ... If you stay, it becomes the Plus plan at $149 a month." -> Funnel price ($1 then Plus at $149/mo) is accurate to the $1-week funnel, but regular Plus is $199 and the pricing page never shows Plus. 'Full suite' includes Gold on 5 listings and no Red. -> 'Then Plus at $149/mo (regular price $199)' and 'Plus plan, 7 days'.

### `src/components/ApexQuiz.tsx`
- L203, L345 [STAT] "12,203 lines in the real scan we use as proof"; "The full suite for 7 days" -> See ApexScanFunnel: second, inconsistent 'real scan'. Source in lib/quizResults.ts says Bilo Distributor. -> Cite one dataset.

### `src/lib/quizResults.ts`
- L46, L59, L72 [STAT] "Most sellers making the move to wholesale start on Starter or Plus"; "usually run Starter or Plus"; "usually run Pro" -> Statistical claims about plan choice, with no data (and Plus is not shown on the pricing page). -> 'Starter and Plus suit ...' as a recommendation, not a statistic.

### `src/components/PopQualify.tsx`
- L219, L245, L283 [EVID] "A proven FBA directory of 389+ verified suppliers, vetted for 2026"; "100% Ungating Roadmap" -> 'Proven' and 'verified' with no standard, a year stamp, and '100% Ungating' reads as 100% ungating success. Directory is Annual only on the Vault page. -> 'A directory of 389 distributors'; 'Ungating roadmap'.

### `src/components/Proposal.tsx`
- L65 [EVID] "389+ vetted Amazon FBA suppliers" (noindex page) -> Same 'vetted' claim. -> Same fix.

### `src/components/Auth.tsx`
- L1020, L1023, L1027 [EVID] Sign-up benefits: "White-glove onboarding: 160 minutes of Amazon education..."; "A real account manager"; "Built to pay for itself" -> Service promises shown to every signup including the $49.99 Beginner plan, with no definition. Repeated in 2 blog posts as 'dedicated account manager'. -> State exactly what each plan gets (e.g. onboarding call), or REMOVE.

### `src/components/ApexVasPromo.tsx`
- L121 [EVID] "more than 20 years of Amazon experience across the team behind them" -> Conflicts with ApexElite '9+ years Amazon experience' for the same VAs. -> Use one verified figure.

### `src/components/landing/VaComparison.tsx`
- L48, L59 [OVER] "Trackable performance ... Guaranteed."; skills list "Shipment creation" -> 'Guaranteed' is unqualified; shipment creation is Red (beta). -> 'Their work lands in your Apex account'; drop Shipment creation or say beta.

### `src/components/TrustpilotBadge.tsx`
- L10 [EVID] TRUSTPILOT = { score: 4.0, reviews: 4 } -> Hand-maintained. TrustpilotReviews lists four reviews, all 5-star, which averages 5.0, not 4.0. One of the two is stale. Displayed on every Pop page and the homepage. -> Re-read the live profile and update both.

### `src/components/TrustpilotReviews.tsx`
- L5 [EVID] Reviews copied by hand ("Every one is a real review as published there") -> Genuine per the comment. Risks: staleness, and review 2 quotes 'their new repricer' while it is beta. Keep dated and linked. Not a fabricated source. -> Keep; add a re-check date internally.

### `src/components/BlogCta.tsx`
- L14 [STATUS] "Apex Black, Blue, Green & Red connect sourcing, purchasing, and profit tracking into one suite." -> Omits Gold; presents Red as live. Shown at the foot of every blog post. -> 'Apex Black, Blue and Green connect ... Red and Gold are in beta'.

### `src/components/fba/FbaCalculator.tsx`
- L512, L551 [POLICY] "Most categories are around 15 percent ... most have a minimum of $0.30"; "A rank that is improving ... is the best sign for a reorder" -> Referral fee varies 5 to 17% by category and price tier (blog tables). Rank-trend sentence is an overclaim. -> 'Referral fees range by category; see Amazon's current table'.
- L542 [STAT] "A healthy wholesale product usually clears at least 15 percent margin and a return on investment above 30 percent" -> Benchmark with no source; blog says 15 to 25% net is 'good' and 20 to 30% ROI is a typical filter. Inconsistent. -> Cite or present as the Apex default filter, not an industry norm.

### Files checked with no open finding

- `src/data/compareIndexCards.ts`: card copy is accurate. 'AI repricer' for Seller Snap is a description of the rival and is fine; COMPARISON_COUNT is derived.
- `src/components/ComparePage.tsx`, `RelatedComparisons.tsx`: frame only, no claims.
- `src/components/ContentPage.tsx`: frame with a fixed caveat block. Good pattern.
- `src/app/layout.tsx` (Organization, WebSite schema): descriptions are accurate; no ratings, no invented offers. The `/pricing` SoftwareApplication schema omits Plus (counted above).
- `src/components/AgentInfrastructure.tsx`, `app/ai/page.tsx`, `app/docs/mcp/page.tsx`, `app/integrations/*`: rebuilt at 13:08 to 13:12. They match verified truth: reads on every paid plan including the trial; drafts only on a Pro write link; Claude and ChatGPT only; audit log live; OAuth and per-tool scopes planned; 'never submit, spend, ship, or change a live price'. Counts of 16 read and 3 draft tools come from config.
- `src/app/amazon-review-automation/page.tsx`, `amazon-inventory-management-software/page.tsx`, `amazon-fba-prep-centers/page.tsx`, `amazon-wholesale-suppliers/page.tsx`: the most careful copy on the site (explicit caveats, no outcome claims). Only the minor items above.

## Already fixed in the live copy while I audited

Confirm these ship, and that nothing re-introduces them.

- `config/offer.ts`: Plus was `monthly: 149`; now 199 (live Price 19900). It is still withheld from `PLANS_SHOWN` (listed above).
- `config/features.ts`: `MODULE_STATUS.gold` was 'live' while `/features/gold` and the map said beta; now 'beta'.
- `components/SuiteMap.tsx`: the Black module was labelled 'APEX CORE' and the Review Booster item read 'Automate Your Order Reviews & Boost Seller Feedback'. Both replaced.
- `components/Navigation.tsx`: Review Booster menu text 'Boost Seller Feedback' replaced; Beta tags added through `isBeta()`; header button 'SIGN UP FREE' is now 'SIGN UP'.
- `components/LandingPage.tsx` (homepage): the old page said 'Join hundreds of wholesale experts using Apex', 'intelligence engine predicts Amazon rank fluctuations and competitor replenishment cycles, ensuring the leads you buy today don't become dead inventory', 'Process millions of supplier data points in seconds', 'Auto-filtering of suppressed buy-box or IP-claim brands', 'error-free orders', 'save hours on POs'. All gone in the rewrite. Remaining homepage items are listed above.
- `app/llms.txt/route.ts`: the old file said 'automated review generation', 'four connected modules: Black, Blue, Green and Red', 'free lifetime Review Booster', 'Free-for-life automated tool for generating Amazon order reviews', 'Starter Plan and Pro Plan' only, and 'against Helium 10, Jungle Scout, SmartScout, and Seller Snap' (there are 16). Rebuilt from config; one small item remains above.
- `components/AgentInfrastructure.tsx` (the /ai page): the version I first read said 'any MCP-compatible' agents, '290k+ seller products tracked' (config says active rows are 130,888), and had the page meta saying 'read access' only. All replaced.

Auto-detected as fixed (quoted text no longer present):
- `src/app/llms.txt/route.ts` [OVER] "automated review generation"; "Free-for-life automated tool for generating Amazon order reviews and seller feedback"
- `src/app/llms.txt/route.ts` [STATUS] "four connected modules: Apex Black, Apex Blue, Apex Green, and Apex Red, plus a free lifetime Review Booster tool and a 7-day free trial on every paid plan"
- `src/app/llms.txt/route.ts` [PRICE] "Starter Plan and Pro Plan, both with a 7-day free trial"
- `src/app/llms.txt/route.ts` [STATUS] Red and Gold lines
- `src/app/llms.txt/route.ts` [STAT] "Index of honest comparisons against Helium 10, Jungle Scout, SmartScout, and Seller Snap"
- `src/app/llms.txt/route.ts` [PRICE] "$297 one-time offer ... 90 days of the full Apex Suite ... free lifetime Review Booster"
- `src/components/Navigation.tsx` [OVER] Menu: "Automate Your Order Reviews & Boost Seller Feedback" (Black column)
- `src/components/Navigation.tsx` [PRICE] Header button "SIGN UP FREE"

## Overlapping pages

**Review request pages** (same target keyword, four voices):
- `/review-booster` (`ReviewBooster.tsx`, indexed, priority 0.6): old-style promo page for the 'Free Review Automation Tool'; audience new and established sellers arriving from the menu. Most inaccurate page in this group.
- `/amazon-review-automation` (`ContentPage`, indexed 0.7): editorial explainer of what Request a Review automation can and cannot do; audience searchers asking if it is allowed. The accurate one; make the others match it.
- `/features/black` (`ApexBlack.tsx`, indexed 0.8): module page whose title is 'Amazon Review Request Automation | Apex Black', so it competes with the two above; also covers dashboard, University and Resource Library.
- `/blog/automate-review-requests`: long guide on compliant requests ending in an Apex pitch (uses 'free for life on every plan' and invented 60/40 percentages).
- Perk mentions: `/fba-starter-bundle`, `/apex-elite`, `/zero-to-hero`, `CourseLanding`, `RewardsBenefits`, `/blog/cost-of-seller-software`, `/blog/why-apex-applications`.

**Ungating pages:**
- `/ungating-guide` (`UngatingGuide.tsx`, indexed 0.7): primer on category vs brand gating plus a Grocery walkthrough with a Frontier Co-op purchase; audience brand-new sellers.
- `/blog/amazon-ungating-guide`: long article centred on the invoice, carries the 70 percent claim and the 10 units / 90 to 180 day numbers; audience sellers preparing an application.
- `/blog/start-amazon-wholesale` and `/blog/challenges-of-amazon-wholesale`: each restates the 70 percent claim.
- `/how-it-works` step 1 ('Ungating Unlock SOP'), `/amazon-wholesale-suppliers` ('ask the questions Amazon will ask you'), `/purchase-order-program` and `/apex-pop*` (noindex; selling approvals), `RewardsBenefits` ('ready to un-gate you').

**Suppliers and distributors** (three entitlement rules in circulation):
- `/distributor-vault` ('Annual Members Only', 389+ names, blurred), `/amazon-wholesale-suppliers` ('grows the longer the subscription runs'), `/ungating-guide`, `/amazon-wholesale-software`, `PickPlan` FAQ, `PopQualify`, `PrimewellLeadForm` ('3 on sign up, plus 3 every month'), `/blog/find-wholesale-suppliers`. Pick one rule and define it once.

**Prep centres:**
- `/prep-center-network` (member discounts, 'Apex Approved Partner'), `/amazon-fba-prep-centers` ('we do not rank or endorse providers'), `/blog/choosing-a-prep-center`, `/features/red`, `/for-prep-centers` (software for the centres themselves). The first two contradict each other.

**Courses:** `/free-course` (free, no card), `/zero-to-hero` (free for 7 days with a trial), `/wholesale-course` ($29 once, noindex). All three describe the same nine videos with different offers.

**'What Apex is' pages:** `/` (rewritten), `/amazon-wholesale-software`, `/how-it-works`, `/how-apex-works` (noindex, full docs), `/blog/why-apex-applications`, `/blog/everything-apex-gives-you`, `/blog/cost-of-seller-software`. The three blog posts repeat the four-module, account-manager and free-for-life claims.

**Inventory and restock:** `/amazon-inventory-management-software` (says no forecast) vs `ApexBlue.tsx` ('precise buy recommendations', 'forecasting'); keep the first wording.

**Funnel pages (noindex):** `/apex-pop`, `/apex-pop-facebook`, `/apex-pop-primewell`, `/apex-pop-reddit`, `/apex-scan`, `/apex-quiz`, `/start`, `/watch`, `/walkthrough`, `/primewell`, `/purchase-order-program`, `/proposal`, `/first-order-roadmap`. They carry the shared catalog-scan statistics and the 'full suite' $1-week wording; they are not in search but ads point at them.

**Chrome extension:** `Footer.tsx` links it and it is live; `CompareHelium10/JungleScout/SmartScout` say Apex has none; `comparisons.ts` says 'Free for Apex University graduates'.

## Other notes

- **Date stamps on customer-facing pages** (house rule is to avoid them): ApexRed 'Scope checked 14 September 2026', comparison footers 'verified September 2026', VaComparison `RATE_NOTE_AS_OF`, UngatingGuide 'price as of 2026', PopQualify 'vetted for 2026'.
- **Fee schedule and Amazon dates in the blog** (3.5 percent surcharge from April 17 2026, peak window dates, tiered referral table) were not verified against Amazon; they need a re-check before each publish.
- **Trustpilot** is the only third-party evidence source and is real, but the two hand-maintained files disagree (score 4.0 vs four 5-star reviews).
- Competitor prices on comparison pages are dated to September 2026 research and not re-checked here.
