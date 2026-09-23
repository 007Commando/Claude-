import type { Coverage } from "../components/CompareShared";
import { PLAN_LIMITS, limitLabel, salesCeilingLabel } from "../config/offer";

/**
 * The comparisons, as data.
 *
 * Layout is shared; content is not. Every record here was written from the
 * September 13, 2026 research pass against each competitor's own pricing page,
 * and the rules that pass set are enforced by the shape of this type rather
 * than left to whoever edits it next:
 *
 * - A capability we have not verified is the string "Not verified", never
 *   `false`. Unknown is not absent, and a red cross beside a competitor's name
 *   is a claim about their product we would have to be able to defend.
 * - `priceBars` is optional because it is only honest when the intervals are
 *   comparable. sellerboard's headline is an annual figure; drawing it as a bar
 *   beside monthly prices would say something the number does not.
 * - Apex Red is in beta. Every record whose rival competes with Red says so,
 *   because shipping software you cannot buy yet is not a comparison, it is an
 *   advertisement for a roadmap.
 */
export type CompareCell = string | boolean;

export type Comparison = {
  slug: string;
  rival: string;
  /** Card text on /compare — leads with what the rival is good at. */
  category: string;
  frame: string;
  title: string;
  description: string;
  h1: string;
  /** The opening paragraph, as JSX-free segments so the data stays plain. */
  intro: string;
  /** Which Apex module the page hands off to. */
  moduleHref: string;
  moduleLabel: string;
  coverage: Coverage[];
  rows: { label: string; apex: CompareCell; rival: CompareCell }[];
  priceBars?: { label: string; price: number; caption: string; apex?: boolean }[];
  chooseRival: string[];
  chooseApex: string[];
  ctaLine: string;
  shotCaption: string;
  sources: { label: string; href: string }[];
};

/**
 * Apex's own entry price, repeated in the bars. Kept in one place here.
 *
 * The caption used to read "Every module, no listing or revenue caps", and it
 * rendered on every comparison page carrying price bars. It was not true:
 * `PLAN_LIMITS.starter` enforces a $10K monthly sales ceiling and 1,000 housed
 * ASINs, and crossing the sales figure moves the customer onto Plus rather than
 * warning them. Telling a competitor's customer we have no caps, three inches
 * above a table criticising theirs, is the one claim on these pages a rival
 * could screenshot.
 *
 * So the caps are stated, and read from the file that enforces them, which is
 * the only version that cannot drift back.
 */
const APEX_BAR = {
  label: "Apex Starter (whole suite)",
  price: 149,
  caption: `Every module. ${salesCeilingLabel("starter")}, ${limitLabel(PLAN_LIMITS.starter.housedAsins)} ASINs`,
  apex: true,
};

/**
 * What our plans allow, for the rows that compare tier against tier.
 *
 * Derived rather than typed, for the reason above APEX_BAR: four of these rows
 * said "No listing caps" while billing enforced one.
 */
const APEX_TIER_LIMITS =
  // Only the first letter is lowered. Lowercasing the whole label turns the
  // $10K into $10k, which reads as a typo in a table about being precise.
  `Starter ${limitLabel(PLAN_LIMITS.starter.housedAsins)} listings, ` +
  `${salesCeilingLabel("starter").replace(/^U/, "u")}; ` +
  `Pro ${limitLabel(PLAN_LIMITS.pro.housedAsins)} and no sales ceiling`;

export const COMPARISONS: Comparison[] = [
  {
    slug: "aura",
    rival: "Aura",
    category: "Dedicated repricer",
    frame:
      "A focused repricing platform with its own automation and analytics. The question is whether you want repricing as a product, or repricing as one step of the buying loop.",
    title: "Apex vs Aura (2026): Repricer Alone, or the Whole Loop | Apex Applications",
    description:
      "Aura is a dedicated repricing platform with automation, analytics and integrations. Apex Gold reprices from break-even floors inside a full wholesale suite. Current pricing, checked September 2026.",
    h1: "Apex Applications vs Aura",
    intro:
      "Aura is a dedicated repricing platform with automation, analytics and integrations, and a seller who wants a focused repricing workflow should evaluate it on its own terms. Apex Gold is a repricer that sits inside the suite that produced the numbers it prices against: floors computed from your real fees, connected to the purchase orders and P&L those prices feed.",
    moduleHref: "/features/gold",
    moduleLabel: "Apex Gold",
    coverage: [
      { state: "none" },
      { state: "none" },
      { state: "full", note: "repricing platform" },
      { state: "none" },
      { state: "partial", note: "repricing analytics" },
    ],
    rows: [
      { label: "What it is", apex: "Full suite including the repricer", rival: "Dedicated repricing platform" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$47/mo, rising to $97 / $197 / $297" },
      { label: "Free trial", apex: "7 days, card required", rival: "14 days, no card" },
      { label: "Repricing automation", apex: true, rival: true },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
      { label: "Floors set by ROI, margin or profit goal in bulk", apex: true, rival: "Not verified" },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "Catalog scanning against the marketplace", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: "Repricing analytics" },
      { label: "Tier limits", apex: APEX_TIER_LIMITS, rival: "Compare tier limits, not entry price alone" },
    ],
    priceBars: [
      { label: "Aura entry", price: 47, caption: "Lowest of four tiers; check the limits on it" },
      APEX_BAR,
      { label: "Aura top tier", price: 297, caption: "Repricing platform" },
    ],
    chooseRival: [
      "Repricing is the one job you are buying software for, and you want a platform built around only that.",
      "You want to try it without handing over a card first. Aura's trial is 14 days and takes none.",
      "Its tier limits fit your listing count more cheaply than a full suite you would not use.",
    ],
    chooseApex: [
      "You want price floors derived from your own landed costs and fees rather than min/max fields you calculate yourself.",
      "The prices, the purchase orders and the profit report should be the same system, so a floor and a reorder decision cannot disagree.",
      "You would rather one subscription covered sourcing, buying, pricing and books than assemble them.",
    ],
    ctaLine:
      "Repricing is one decision inside a loop: buy, price, restock, bank. Apex runs the loop.",
    shotCaption: "The repricer is one tab. The POs it protects and the P&L it feeds are the tabs beside it.",
    sources: [{ label: "Aura pricing", href: "https://goaura.com/pricing" }],
  },

  {
    slug: "bqool",
    rival: "BQool",
    category: "Tiered repricer",
    frame:
      "Tiered repricing with both AI and rule-based capacity, starting well below a suite subscription. If repricing is the only gap, the entry tier is worth pricing out.",
    title: "Apex vs BQool (2026): Cheaper Repricing, or Fewer Tools | Apex Applications",
    description:
      "BQool offers tiered repricing with AI and rule-based capacity from $25/mo. Apex Gold reprices from break-even floors inside a full suite at $149. Current pricing, checked September 2026.",
    h1: "Apex Applications vs BQool",
    intro:
      "BQool offers tiered repricing with both AI and rule-based capacity, and its lower entry price may suit a seller who needs exactly that function and nothing else. Apex Gold is a repricer inside a wholesale suite, priced as part of it. Read the entry tiers carefully: BQool's lowest tier distinguishes how many listings it will reprice with AI from how many it will reprice by rule.",
    moduleHref: "/features/gold",
    moduleLabel: "Apex Gold",
    coverage: [
      { state: "none" },
      { state: "none" },
      { state: "full", note: "AI + rule-based" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Full suite including the repricer", rival: "Tiered repricing tool" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$25/mo, rising to $50 / $100 / $200 / $300" },
      { label: "Free trial", apex: "7 days, card required", rival: "14 days" },
      { label: "AI repricing", apex: false, rival: true },
      { label: "Rule-based repricing", apex: true, rival: true },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
      { label: "Listing capacity", apex: APEX_TIER_LIMITS, rival: "Tiered: AI and rule-based capacity differ per tier" },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "Catalog scanning against the marketplace", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: false },
    ],
    priceBars: [
      { label: "BQool entry", price: 25, caption: "Check the AI vs rule-based listing capacity on this tier" },
      { label: "BQool mid", price: 100, caption: "Repricing only" },
      APEX_BAR,
      { label: "BQool top", price: 300, caption: "Repricing only" },
    ],
    chooseRival: [
      "You already have sourcing, purchasing and accounting handled, and repricing is the only thing missing.",
      "You want AI repricing specifically. Apex Gold is rule and strategy driven, not an AI bidder.",
      "$25 to $50 a month solves your problem and a suite subscription would be mostly unused.",
    ],
    chooseApex: [
      "You want the floor under every price to come from your real landed cost, not a number you maintain by hand.",
      "You would otherwise be buying a scanner, a PO tool and an analytics tool alongside the repricer.",
      "You want one place where a price change and a restock decision read from the same cost data.",
    ],
    ctaLine:
      "If repricing is genuinely the only gap, BQool is cheaper. If it is one of four, this is the arithmetic to do.",
    shotCaption: "One subscription, and the repricer is a tab inside it rather than a separate bill.",
    sources: [{ label: "BQool repricing pricing", href: "https://www.bqool.com/repricing" }],
  },

  {
    slug: "informed-repricer",
    rival: "Informed Repricer",
    category: "Flat-rate repricer",
    frame:
      "Automated repricing on one flat monthly price, with no user or listing limits published. A clean offer if repricing is the whole job.",
    title: "Apex vs Informed Repricer (2026): Flat-Rate Repricing Compared | Apex Applications",
    description:
      "Informed Repricer is $199/month flat with a 14-day no-card trial and no published listing limits. Apex Gold reprices from break-even floors inside a $149 suite. Checked September 2026.",
    h1: "Apex Applications vs Informed Repricer",
    intro:
      "Informed emphasises automated repricing on a flat monthly offer, and its pricing page lists no user or listing limits, a genuinely simple proposition if repricing is what you are buying. Validate the supported marketplaces and features against your own operation. Apex Gold prices from break-even floors computed inside the suite that holds your costs.",
    moduleHref: "/features/gold",
    moduleLabel: "Apex Gold",
    coverage: [
      { state: "none" },
      { state: "none" },
      { state: "full", note: "flat-rate" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Full suite including the repricer", rival: "Automated repricing, flat rate" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$199/mo flat" },
      { label: "Free trial", apex: "7 days, card required", rival: "14 days, no card" },
      { label: "Published listing limits", apex: "None", rival: "None listed on their pricing page" },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
      { label: "Floors set by ROI, margin or profit goal in bulk", apex: true, rival: "Not verified" },
      { label: "Marketplaces", apex: "Amazon", rival: "Verify against your own marketplaces" },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "Catalog scanning against the marketplace", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: false },
    ],
    priceBars: [
      APEX_BAR,
      { label: "Informed Repricer", price: 199, caption: "Flat monthly, no published listing limits" },
    ],
    chooseRival: [
      "You want one flat price with no tier arithmetic and no listing ceiling to watch.",
      "You need marketplaces or repricing features Apex Gold does not cover. Check theirs against your list.",
      "You want a no-card trial before committing anything.",
    ],
    chooseApex: [
      "The whole suite costs less than their repricer alone, and repricing is only one of the jobs in it.",
      "You want floors anchored to landed cost and real fees rather than bounds you set yourself.",
      "Your pricing, buying and profit reporting should share one set of numbers.",
    ],
    ctaLine:
      "Their repricer is $199. The entire Apex suite, repricer included, is $149.",
    shotCaption: "Everything in this window is in the $149 plan, not just the repricing tab.",
    sources: [
      { label: "Informed Repricer pricing", href: "https://www.informedrepricer.com/pricing" },
    ],
  },

  {
    slug: "repricer",
    rival: "Repricer.com",
    category: "Multichannel repricer",
    frame:
      "Tiered, multichannel repricing. If you sell across more than Amazon, this is a different and legitimate shape of problem to the one Apex solves.",
    title: "Apex vs Repricer.com (2026): Multichannel or Amazon Depth | Apex Applications",
    description:
      "Repricer.com runs $99/$299/$499 with a 14-day no-card trial and a multichannel focus. Apex Gold reprices Amazon from break-even floors inside a full suite. Checked September 2026.",
    h1: "Apex Applications vs Repricer.com",
    intro:
      "Repricer.com supports a multichannel focus with tiered automation, and if you sell beyond Amazon that breadth is the argument. Check which tier you actually need for net-margin features, reporting, channels and integrations. The pricing cards and the tier detail do not always describe the limits in the same words, so confirm the tier before you buy. Apex is Amazon-deep rather than channel-wide.",
    moduleHref: "/features/gold",
    moduleLabel: "Apex Gold",
    coverage: [
      { state: "none" },
      { state: "none" },
      { state: "full", note: "multichannel" },
      { state: "none" },
      { state: "partial", note: "reporting by tier" },
    ],
    rows: [
      { label: "What it is", apex: "Amazon wholesale suite incl. repricer", rival: "Multichannel repricing" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$99/mo, rising to $299 / $499" },
      { label: "Free trial", apex: "7 days, card required", rival: "14 days, no card" },
      { label: "Channels beyond Amazon", apex: false, rival: true },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Net-margin features vary by tier" },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "Catalog scanning against the marketplace", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: "Reporting varies by tier" },
      { label: "SKU and channel limits", apex: APEX_TIER_LIMITS, rival: "Vary by tier; add-ons apply" },
    ],
    priceBars: [
      { label: "Repricer.com entry", price: 99, caption: "Check channel and SKU limits on this tier" },
      APEX_BAR,
      { label: "Repricer.com mid", price: 299, caption: "Multichannel repricing" },
      { label: "Repricer.com top", price: 499, caption: "Multichannel repricing" },
    ],
    chooseRival: [
      "You sell on channels beyond Amazon and want one repricer across all of them.",
      "You need specific integrations on their list that Apex does not have.",
      "Repricing is the product you are buying, and the rest of your stack is settled.",
    ],
    chooseApex: [
      "Amazon wholesale is the business, and depth on that one channel beats breadth across several.",
      "You want the repricer, the purchase orders and the profit report to be one system.",
      "You would rather not work out which tier contains the margin features you assumed were included.",
    ],
    ctaLine:
      "Multichannel is a real advantage. So is having one system for buying, pricing and banking on the channel you actually sell on.",
    shotCaption: "Amazon end to end: scan, buy, price, ship, reconcile.",
    sources: [{ label: "Repricer.com pricing", href: "https://www.repricer.com/pricing/" }],
  },

  {
    slug: "selleramp",
    rival: "SellerAmp",
    category: "Sourcing research",
    frame:
      "Product research across mobile, browser extension and web. Apex does not replace a phone scanner. If that is how you source, test before you switch.",
    title: "Apex vs SellerAmp (2026): Product Checks vs the Buying Workflow | Apex Applications",
    description:
      "SellerAmp SAS runs $19.95/$29.95/$49.95 with mobile, extension and web product research. Apex Green scans whole wholesale catalogs. An honest comparison, checked September 2026.",
    h1: "Apex Applications vs SellerAmp",
    intro:
      "SellerAmp SAS supports product research through its mobile app, browser extension and web formats, and if you source by scanning items in front of you, that is a workflow Apex does not replicate. Apex Green starts from the other end: a supplier's whole price list, matched against the marketplace in bulk, and carried through to a purchase order. Test your own requirements before switching; do not assume Apex replaces a mobile scanner or an extension.",
    moduleHref: "/features/green",
    moduleLabel: "Apex Green",
    coverage: [
      { state: "full", note: "single-product" },
      { state: "none" },
      { state: "partial", note: "via BQool" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale catalog scanning and buying", rival: "Single-product research across formats" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$19.95/mo, rising to $29.95 / $49.95" },
      { label: "Free trial", apex: "7 days, card required", rival: "14 days" },
      { label: "Mobile scanning app", apex: false, rival: true },
      { label: "Browser extension", apex: false, rival: true },
      { label: "Bulk catalog scanning", apex: true, rival: "Not verified" },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: "Via BQool integration; needs both subscriptions" },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: false },
    ],
    priceBars: [
      { label: "SellerAmp entry", price: 19.95, caption: "Product research; repricing needs BQool as well" },
      { label: "SellerAmp top", price: 49.95, caption: "Product research" },
      APEX_BAR,
    ],
    chooseRival: [
      "You source by scanning products in a store or on a page, and the mobile app or extension is the job.",
      "You want a low monthly cost for product checks and nothing more.",
      "You already run repricing through BQool and the integration suits you.",
    ],
    chooseApex: [
      "You buy from wholesale price lists rather than one product at a time, and want the whole file scanned at once.",
      "You want the research to end in a purchase order rather than a verdict.",
      "You would rather not hold two subscriptions to get sourcing and repricing.",
    ],
    ctaLine:
      "Take one supplier price list through scanning, matching and a purchase order, and compare the manual steps.",
    shotCaption: "A supplier's whole catalog, matched against the marketplace and turned into a buy.",
    sources: [{ label: "SellerAmp pricing", href: "https://selleramp.com/pricing/" }],
  },

  {
    slug: "seller-assistant",
    rival: "Seller Assistant",
    category: "All-in-one sourcing",
    frame:
      "Already spans sourcing, price-list analysis, purchasing and repricing. This is the comparison where 'all in one' proves nothing: the detail has to.",
    title: "Apex vs Seller Assistant (2026): Two All-in-Ones Compared | Apex Applications",
    description:
      "Seller Assistant spans sourcing, price-list analysis, purchasing and repricing at $29.99 to $189.99. So does Apex. A comparison that goes past the words 'all in one'. Checked September 2026.",
    h1: "Apex Applications vs Seller Assistant",
    intro:
      "Seller Assistant already spans sourcing, price-list analysis, purchasing and repricing, which means calling Apex an all-in-one proves nothing here. The useful comparison is narrower: which specific tasks each one does for the way you buy, what the plans allow, and what you would still do by hand. Its allowances for repricing and trials vary by plan and billing interval, so compare the tier you would actually be on.",
    moduleHref: "/features/green",
    moduleLabel: "Apex Green",
    coverage: [
      { state: "full", note: "sourcing" },
      { state: "partial", note: "purchasing" },
      { state: "partial", note: "by plan" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Amazon wholesale suite", rival: "Sourcing, price lists, purchasing, repricing" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "Pro $29.99, Business $79.99, Business Plus $189.99" },
      { label: "Free trial", apex: "7 days, card required", rival: "Varies by plan and billing interval" },
      { label: "Price-list analysis", apex: true, rival: true },
      { label: "Browser extension", apex: false, rival: true },
      { label: "Repricing", apex: "Included on every plan", rival: "Allowance varies by plan" },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
      { label: "Purchase orders and restock planning", apex: true, rival: "Purchasing features; compare scope" },
      { label: "P&L and cashflow from your own store", apex: true, rival: "Not verified" },
      { label: "Prep and warehouse network", apex: true, rival: "Not verified" },
    ],
    priceBars: [
      { label: "Seller Assistant Pro", price: 29.99, caption: "Compare the repricing allowance on this plan" },
      { label: "Seller Assistant Business", price: 79.99, caption: "Mid tier" },
      APEX_BAR,
      { label: "Seller Assistant Business Plus", price: 189.99, caption: "Top tier" },
    ],
    chooseRival: [
      "Their extension is central to how you work, and you want research in the page you are already on.",
      "Their lower tiers cover your volume and the repricing allowance is enough for your catalog.",
      "You have tested both and their sourcing data fits your suppliers better.",
    ],
    chooseApex: [
      "You want repricing included at full capacity on every plan rather than metered by tier.",
      "You want price floors computed from your own landed costs, prep and shipping rather than entered manually.",
      "You want the prep and warehouse side of the operation in the same system as the buying.",
    ],
    ctaLine:
      "Two products that both say all-in-one. Run one catalog through each and the difference stops being a slogan.",
    shotCaption: "Sourcing, buying, pricing and books as tabs of one system.",
    sources: [
      { label: "Seller Assistant pricing", href: "https://www.sellerassistant.app/pricing/" },
    ],
  },

  {
    slug: "scan-unlimited",
    rival: "Scan Unlimited",
    category: "Bulk catalog scanning",
    frame:
      "A focused bulk-scanning workflow with a genuinely free entry tier. If scanning is the only job you need doing, this is the honest cheaper answer.",
    title: "Apex vs Scan Unlimited (2026): Scanning Alone, or What Follows | Apex Applications",
    description:
      "Scan Unlimited offers a free tier of one 10,000-product file a month and Unlimited at $70. Apex Green scans and carries results into purchase orders. Checked September 2026.",
    h1: "Apex Applications vs Scan Unlimited",
    intro:
      "Scan Unlimited offers a focused bulk analysis workflow and a free entry tier, and when scanning really is the only job you need, that is a sensible fit and a cheaper one. The difference is what happens to the results: Apex Green scans a supplier's catalog and then carries the profitable lines into a purchase order, a prep plan and a profit report.",
    moduleHref: "/features/green",
    moduleLabel: "Apex Green",
    coverage: [
      { state: "full", note: "bulk scanning" },
      { state: "none" },
      { state: "none" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale suite incl. bulk scanning", rival: "Bulk catalog analysis" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "Free tier; Unlimited $70/mo, or $60/mo billed annually" },
      { label: "Free tier", apex: "7-day trial of everything", rival: "One file a month, up to 10,000 products" },
      { label: "Bulk catalog scanning", apex: true, rival: true },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: false },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "Prep and warehouse network", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: false },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
    ],
    priceBars: [
      { label: "Scan Unlimited (annual equivalent)", price: 60, caption: "Unlimited plan billed annually" },
      { label: "Scan Unlimited monthly", price: 70, caption: "Scanning only" },
      APEX_BAR,
    ],
    chooseRival: [
      "Scanning is the only gap, and one 10,000-product file a month covers how you buy.",
      "You already have repricing, purchasing and accounting you are happy with.",
      "You want to start at no cost before paying anything.",
    ],
    chooseApex: [
      "The scan is the start of the job, not the end. You want the buy, the prep and the books to follow from it.",
      "You would otherwise pay for a scanner, a repricer and an analytics tool separately.",
      "You want the profitability on screen to use your real prep and shipping costs.",
    ],
    ctaLine:
      "If you only need the scan, take their free tier. If the scan is step one of four, this is the comparison.",
    shotCaption: "The scan results become housed products, purchase orders and a P&L.",
    sources: [{ label: "Scan Unlimited pricing", href: "https://www.scanunlimited.com/pricing" }],
  },

  {
    slug: "rocket-source",
    rival: "Rocket Source",
    category: "Scanner and identifier tools",
    frame:
      "Catalog analysis plus useful identifier tools, with free and low-cost scanner plans. A scanner-only buyer may not need a suite subscription at all.",
    title: "Apex vs Rocket Source (2026): Scanner Plans Compared | Apex Applications",
    description:
      "Rocket Source offers a free weekly 50,000-product scan plus Growth $49 and Scale $69. Apex Green scans and carries results into buying and prep. Checked September 2026.",
    h1: "Apex Applications vs Rocket Source",
    intro:
      "Rocket Source offers catalog analysis and useful identifier tools, with a free weekly scan and low-cost paid plans. A buyer who needs a scanner and nothing else may genuinely not need the broader Apex subscription, and that is worth saying plainly. What Apex adds is everything after the scan: the purchase order, the prep plan, the repricing floor and the profit report.",
    moduleHref: "/features/green",
    moduleLabel: "Apex Green",
    coverage: [
      { state: "full", note: "scan + identifiers" },
      { state: "none" },
      { state: "none" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale suite incl. bulk scanning", rival: "Catalog scanning and identifier tools" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "Free weekly scan; Growth $49, Scale $69" },
      { label: "Free tier", apex: "7-day trial of everything", rival: "One weekly scan, up to 50,000 products" },
      { label: "Bulk catalog scanning", apex: true, rival: true },
      { label: "Identifier lookup tools", apex: "Not published", rival: true },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: false },
      { label: "Purchase orders and restock planning", apex: true, rival: false },
      { label: "Prep and warehouse network", apex: true, rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: false },
    ],
    priceBars: [
      { label: "Rocket Source Growth", price: 49, caption: "Scanner plan; check current usage limits" },
      { label: "Rocket Source Scale", price: 69, caption: "Scanner plan" },
      APEX_BAR,
    ],
    chooseRival: [
      "You want a scanner and identifier tools, and the rest of your operation is already covered.",
      "The free weekly 50,000-product scan is enough for how often you buy.",
      "You are not ready to move purchasing and accounting into one system.",
    ],
    chooseApex: [
      "You want the scan to end in a purchase order rather than a spreadsheet you re-key.",
      "Your profitability numbers should include your actual prep and shipping costs.",
      "You would otherwise be paying for three or four tools that do not share data.",
    ],
    ctaLine:
      "Their free scan is a good place to start. This is the comparison for when the scan stops being the hard part.",
    shotCaption: "What happens to a scan result once it is a decision rather than a row.",
    sources: [{ label: "Rocket Source pricing", href: "https://www.rocketsource.io/pricing" }],
  },

  {
    slug: "sellerboard",
    rival: "sellerboard",
    category: "Profit analytics",
    frame:
      "Detailed profit analytics, now extending into purchasing and repricing. Anyone still telling you sellerboard has no repricer is working from old notes.",
    title: "Apex vs sellerboard (2026): Profit Analytics Compared | Apex Applications",
    description:
      "sellerboard provides detailed profit analytics and announced a repricer in September 2026. Apex Blue reports profit inside the suite that buys and prices the stock. Checked September 2026.",
    h1: "Apex Applications vs sellerboard",
    intro:
      "sellerboard provides detailed profit analytics and has been expanding into purchasing and repricing. Its September 2026 repricer announcement means any comparison claiming it has no repricing is simply out of date, including ones you may still find elsewhere. The real difference is direction of travel: sellerboard reports on the business and is adding operations; Apex operates the business and reports from the same data.",
    moduleHref: "/features/blue",
    moduleLabel: "Apex Blue",
    coverage: [
      { state: "none" },
      { state: "partial", note: "purchasing" },
      { state: "partial", note: "new repricer" },
      { state: "none" },
      { state: "full", note: "profit analytics" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale suite incl. profit reporting", rival: "Profit analytics, expanding into operations" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "Standard $179/year, presented as about $15/month" },
      { label: "Billing interval", apex: "Monthly or annual", rival: "The $15 figure is an annual equivalent, not a verified monthly price" },
      { label: "Free trial", apex: "7 days, card required", rival: "One month, no card" },
      { label: "Profit and loss reporting", apex: true, rival: true },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: "Announced September 2026; compare it directly" },
      { label: "Purchase orders and restock planning", apex: true, rival: "Purchasing features; compare scope" },
      { label: "Catalog scanning against the marketplace", apex: true, rival: "Not verified" },
      { label: "Prep and warehouse network", apex: true, rival: "Not verified" },
    ],
    chooseRival: [
      "Profit analytics is what you are buying, and theirs is deep, mature and well regarded.",
      "The cost matters more than the breadth. On an annual plan it is a fraction of a suite subscription.",
      "You want a full month to try it without entering a card.",
    ],
    chooseApex: [
      "You want the system that reports your profit to also be the system that bought and priced the stock.",
      "You need catalog scanning and a prep network alongside the reporting.",
      "You would rather one subscription than an analytics tool plus the tools that feed it.",
    ],
    ctaLine:
      "sellerboard tells you what happened. Apex is where it happens, and the report comes from the same data.",
    shotCaption: "The P&L reads from the purchase orders and prices in the tabs beside it.",
    sources: [{ label: "sellerboard", href: "https://sellerboard.com/" }],
  },

  {
    slug: "inventorylab",
    rival: "InventoryLab",
    category: "Listing, shipping and accounting",
    frame:
      "Now part of the Threecolts Seller 365 bundle. Compare the bundle you would actually buy, not the legacy product people remember.",
    title: "Apex vs InventoryLab / Seller 365 (2026): Bundles Compared | Apex Applications",
    description:
      "InventoryLab is now inside Threecolts Seller 365 at $69/month. Apex Red is in beta. An honest comparison of two bundles, checked September 2026.",
    h1: "Apex Applications vs InventoryLab / Seller 365",
    intro:
      "InventoryLab is now presented within Threecolts Seller 365, so the thing you would buy is the bundle rather than the standalone product people remember. Compare the current bundle's listing and shipment functions and its accounting workflow, not the legacy description. On our side, be clear about state too: Apex Red, which covers the shipment and prep workflow, is in beta.",
    moduleHref: "/features/red",
    moduleLabel: "Apex Red",
    coverage: [
      { state: "none" },
      { state: "partial", note: "purchasing" },
      { state: "none" },
      { state: "full", note: "listing + shipping" },
      { state: "full", note: "accounting" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale suite; shipment module in beta", rival: "Part of the Threecolts Seller 365 bundle" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "Seller 365 Standard $69/mo" },
      { label: "Free trial", apex: "7 days, card required", rival: "7 days, plus 7 more after an eligible seller-account connection; their help material says a card is required" },
      { label: "Listing and shipment preparation", apex: "Apex Red (beta)", rival: true },
      { label: "Accounting workflow", apex: true, rival: true },
      { label: "Catalog scanning against the marketplace", apex: true, rival: "Not verified" },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: "Compare what the current bundle includes" },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
      { label: "Purchase orders and restock planning", apex: true, rival: "Compare scope in the bundle" },
    ],
    priceBars: [
      { label: "Seller 365 Standard", price: 69, caption: "The bundle InventoryLab now sits inside" },
      APEX_BAR,
    ],
    chooseRival: [
      "Listing and shipment preparation is the core of your day and you need it production-ready now. Apex Red is beta.",
      "The wider Seller 365 bundle contains other tools you would use.",
      "Their accounting workflow is what your bookkeeping already runs on.",
    ],
    chooseApex: [
      "Sourcing, buying and repricing are the bottleneck, and those are not in beta here.",
      "You want break-even pricing computed from your own costs rather than maintained by hand.",
      "You want one suite for the wholesale loop and are willing to follow Red out of beta.",
    ],
    ctaLine:
      "Apex Red is in beta and this page will say so until it is not. Join the beta, or start with the modules that are not.",
    shotCaption: "The modules that are shipping today, with Red alongside them in beta.",
    sources: [
      {
        label: "Threecolts Seller 365 (InventoryLab)",
        href: "https://www.threecolts.com/seller-365/inventorylab",
      },
    ],
  },

  {
    slug: "boxem",
    rival: "Boxem",
    category: "Listing and shipment prep",
    frame:
      "Focused on listing and shipment preparation, with a clear step-by-step demonstration. Apex Red covers this ground and is still in beta.",
    title: "Apex vs Boxem (2026): Shipment Prep Compared, Honestly | Apex Applications",
    description:
      "Boxem is $49.99/month with a 14-day trial, focused on listing and shipment preparation. Apex Red covers the same ground and is in beta. Checked September 2026.",
    h1: "Apex Applications vs Boxem",
    intro:
      "Boxem focuses on listing and shipment preparation and demonstrates it step by step, which makes it easy to evaluate against your own process. The honest position on our side: Apex Red is the module that competes here, and it is in beta. We are not going to advertise matching shipment functionality from a roadmap, so treat this as a comparison of a shipping product against a shipping beta plus a working wholesale suite.",
    moduleHref: "/features/red",
    moduleLabel: "Apex Red",
    coverage: [
      { state: "none" },
      { state: "none" },
      { state: "none" },
      { state: "full", note: "listing + shipping" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale suite; shipment module in beta", rival: "Listing and shipment preparation" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$49.99/mo" },
      { label: "Free trial", apex: "7 days, card required", rival: "14 days" },
      { label: "Listing and shipment preparation", apex: "Apex Red (beta)", rival: true },
      { label: "Catalog scanning against the marketplace", apex: true, rival: false },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: false },
      { label: "Purchase orders and restock planning", apex: true, rival: "Not verified" },
      { label: "P&L and cashflow from your own store", apex: true, rival: "Not verified" },
    ],
    priceBars: [
      { label: "Boxem", price: 49.99, caption: "Listing and shipment preparation" },
      APEX_BAR,
    ],
    chooseRival: [
      "Shipment preparation is the job you need solved now, in production, not in beta.",
      "You do not need sourcing, repricing or profit reporting from the same vendor.",
      "$49.99 for the one function beats a suite subscription you would part-use.",
    ],
    chooseApex: [
      "Sourcing, buying and repricing are where your time goes, and those modules are live.",
      "You want the shipment step eventually to share data with the buying step, and will take Red in beta to get there.",
      "You would rather consolidate than add another separate tool.",
    ],
    ctaLine:
      "If shipment prep is the bottleneck today, Boxem ships today. Apex Red is in beta; join it with your eyes open.",
    shotCaption: "The live modules, with Red joining them in beta.",
    sources: [{ label: "Boxem", href: "https://www.boxem.com/" }],
  },

  {
    slug: "2d-workflow",
    rival: "2D Workflow",
    category: "Operations and shipping economics",
    frame:
      "Operational workflows, labels and shipping economics. Carrier savings and 2D barcode support are specific claims that have to be checked one by one.",
    title: "Apex vs 2D Workflow (2026): Labels, Carriers and Scope | Apex Applications",
    description:
      "2D Workflow displayed $97/month, focused on operational workflows, labels and shipping economics. Apex Red is in beta. An honest scope comparison, checked September 2026.",
    h1: "Apex Applications vs 2D Workflow",
    intro:
      "2D Workflow emphasises operational workflows, labels and shipping economics. Two cautions before you compare numbers: carrier savings and 2D barcode support are specific capabilities that have to be verified individually rather than assumed on either side, and their own copy gave conflicting trial lengths when we checked, so confirm the current offer on their site rather than trusting a figure here. Apex Red, which covers this ground, is in beta.",
    moduleHref: "/features/red",
    moduleLabel: "Apex Red",
    coverage: [
      { state: "none" },
      { state: "none" },
      { state: "none" },
      { state: "full", note: "labels + carriers" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Wholesale suite; shipment module in beta", rival: "Operational workflow, labels, shipping economics" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$97/mo displayed" },
      { label: "Free trial", apex: "7 days, card required", rival: "Their copy conflicted when checked; confirm on their site" },
      { label: "2D barcode support", apex: "Verify against your own requirement", rival: "Verify against your own requirement" },
      { label: "Carrier discounts", apex: false, rival: "Verify the current terms directly" },
      { label: "Listing and shipment preparation", apex: "Apex Red (beta)", rival: true },
      { label: "Catalog scanning against the marketplace", apex: true, rival: false },
      { label: "Repricing", apex: "Included (Apex Gold)", rival: false },
      { label: "P&L and cashflow from your own store", apex: true, rival: "Not verified" },
    ],
    priceBars: [
      { label: "2D Workflow", price: 97, caption: "Displayed monthly price; confirm current terms" },
      APEX_BAR,
    ],
    chooseRival: [
      "Labels, carrier economics and the physical workflow are the problem you are solving this quarter.",
      "You need shipping operations in production rather than in beta.",
      "Their carrier terms save you more than the price difference. Check them directly.",
    ],
    chooseApex: [
      "The bottleneck is deciding what to buy and what to charge, not moving the boxes.",
      "You want one system where the buying, pricing and reporting already share data.",
      "You are willing to run Red in beta while the rest of the suite does the daily work.",
    ],
    ctaLine:
      "Two different bottlenecks. Ours is the buy-and-price loop; theirs is the box. Pick the one that is costing you.",
    shotCaption: "The buying and pricing loop that runs before a box is ever packed.",
    sources: [{ label: "2D Workflow", href: "https://2dworkflow.com/" }],
  },
  /*
   * Added in a second research pass, September 23, 2026, against each
   * rival's own live pages rather than the September 13 snapshot. Both were
   * written because paid search was about to bid on their names and had
   * nowhere to land the click.
   *
   * Tactical Arbitrage moved while we were looking at it: tacticalarbitrage.com
   * now 301s to the Threecolts Seller 365 page, so the thing a seller buys is
   * the bundle or a standalone plan sold beside it, not the independent
   * product the name still evokes.
   */
  {
    slug: "third-party-profits",
    rival: "Third-Party Profits",
    category: "Amazon wholesale platform",
    frame:
      "The closest thing on this page to what Apex is: supplier leads, UPC scanning, purchase orders, restocking and ungated-brand checks. The comparison comes down to what prices the item afterwards, and to what their tiers allow.",
    title: "Apex vs Third-Party Profits (2026): The Same Loop Compared | Apex Applications",
    description:
      "Third-Party Profits runs supplier leads, UPC scanning, purchase orders, restocking and ungated-brand checks at $67 to $197 a month. So does Apex, with the repricer included at $149. Checked September 2026.",
    h1: "Apex Applications vs Third-Party Profits",
    intro:
      "This is the closest comparison on the site, and pretending otherwise would waste your time. Third-Party Profits builds a supplier pipeline, scans supplier catalogues by UPC, turns what clears into purchase orders, plans the restock and finds the brands your account is already ungated for. That is the same loop Apex runs. Two things separate them and both are worth checking on your own numbers: their site does not mention repricing anywhere, and their tiers are named Limited and Unlimited, so what the limit is matters more here than the entry price does.",
    moduleHref: "/features/green",
    moduleLabel: "Apex Green",
    coverage: [
      { state: "full", note: "UPC scanner" },
      { state: "full", note: "POs + restock" },
      { state: "none" },
      { state: "none" },
      { state: "partial", note: "supplier spend" },
    ],
    rows: [
      { label: "What it is", apex: "Amazon wholesale suite", rival: "Amazon wholesale platform" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$67/mo Limited, $197/mo Unlimited" },
      { label: "Free trial", apex: "7 days, card required", rival: "10 days" },
      { label: "Supplier sourcing and contacts", apex: true, rival: true },
      { label: "Supplier catalog scanning by UPC", apex: true, rival: true },
      { label: "Purchase orders", apex: true, rival: true },
      { label: "Restock planning", apex: true, rival: true },
      { label: "Ungated brand checks", apex: "In bulk, one probe per brand", rival: true },
      { label: "Automated repricing", apex: "Included (Apex Gold)", rival: "Not mentioned on their site" },
      { label: "Break-even floors from your own fee data", apex: true, rival: "Not verified" },
      { label: "Profit reporting", apex: "P&L and cashflow by day, week or month", rival: "Supplier spending and profit tracking" },
      { label: "Tier limits", apex: APEX_TIER_LIMITS, rival: "Tiers are Limited and Unlimited; check what Limited limits" },
    ],
    priceBars: [
      { label: "Third-Party Profits Limited", price: 67, caption: "Entry tier; check what Limited limits" },
      APEX_BAR,
      { label: "Third-Party Profits Unlimited", price: 197, caption: "Top tier" },
    ],
    chooseRival: [
      "Their entry tier is cheaper than ours, and if its limits fit the way you actually buy, that is a real saving every month.",
      "You do not need a repricer inside this, because something else already does that job well for you.",
      "Ten days is longer than seven, and a supplier catalogue takes time to run properly.",
    ],
    chooseApex: [
      "You want the repricer in the same system, with the floor on every listing built from the purchase order you actually placed.",
      "You want profit as a real statement by day, week or month, rather than spend and profit per supplier.",
      "You want the ungating check to sweep the whole catalogue in bulk before you commit to an order.",
    ],
    ctaLine:
      "This is the closest comparison we have written. Run the same supplier list through both and let the results settle it.",
    shotCaption: "The same loop, with the repricer inside it rather than beside it.",
    sources: [{ label: "Third-Party Profits", href: "https://thirdpartyprofits.com/" }],
  },

  {
    slug: "tactical-arbitrage",
    rival: "Tactical Arbitrage",
    category: "Multi-source product research",
    frame:
      "Scans over 1,400 retail sites, plus reverse search, books and Amazon flips. A wider net for finding stock than ours, and now sold mainly inside the Threecolts Seller 365 bundle.",
    title: "Apex vs Tactical Arbitrage (2026): Two Ways to Find Stock | Apex Applications",
    description:
      "Tactical Arbitrage scans retail sites, supplier catalogues, books and Amazon flips, standalone at $59 to $159 or inside Seller 365 from $69. Apex buys wholesale and carries it through to a purchase order. Checked September 2026.",
    h1: "Apex Applications vs Tactical Arbitrage",
    intro:
      "Tactical Arbitrage searches more places for stock than Apex does, and that is the honest headline. Product Search scans over 1,400 retail sites, Reverse Search starts from an Amazon category instead of a retailer, and there is book scouting and Amazon flips besides. Apex does none of that. One of their six modes overlaps with ours: Wholesale Search takes a supplier catalogue and runs matching and profit analysis across the list, which is what Apex Green does. The difference is what happens next. Theirs ends at a profitable shortlist; ours ends at a purchase order, a price floor built from that order and a P&L that reads from both. Worth knowing where it is sold, too: tacticalarbitrage.com now redirects to Threecolts Seller 365, which our InventoryLab page also covers.",
    moduleHref: "/features/green",
    moduleLabel: "Apex Green",
    coverage: [
      { state: "full", note: "1,400+ retail sites" },
      { state: "none" },
      { state: "none" },
      { state: "none" },
      { state: "none" },
    ],
    rows: [
      { label: "What it is", apex: "Amazon wholesale suite", rival: "Multi-source product research" },
      { label: "Entry price", apex: "$149/mo for the whole suite", rival: "$59 to $159/mo standalone, or from $69/mo inside Seller 365" },
      { label: "Free trial", apex: "7 days, card required", rival: "Seller 365: 7 days, plus 7 more after connecting an eligible seller account" },
      { label: "Retail site scanning for online arbitrage", apex: false, rival: "Over 1,400 sites" },
      { label: "Reverse search from an Amazon category", apex: false, rival: true },
      { label: "Book scouting", apex: false, rival: true },
      { label: "Supplier catalog scanning", apex: true, rival: true },
      { label: "Selling eligibility checks", apex: "In bulk, one probe per brand", rival: "Restriction Checker" },
      { label: "Purchase orders and restock planning", apex: true, rival: "Not part of the product" },
      { label: "Automated repricing", apex: "Included (Apex Gold)", rival: "A separate tool in the Seller 365 bundle" },
      { label: "Break-even floors from your own fee data", apex: true, rival: "No repricing in the product" },
      { label: "P&L and cashflow from your own store", apex: true, rival: "Not part of the product" },
    ],
    priceBars: [
      { label: "Tactical Arbitrage entry", price: 59, caption: "Standalone monthly; scan limits vary by tier" },
      { label: "Seller 365 Standard", price: 69, caption: "The bundle it is also sold inside" },
      APEX_BAR,
      { label: "Tactical Arbitrage top", price: 159, caption: "Standalone monthly" },
    ],
    chooseRival: [
      "You source by finding price gaps on retail sites and want the widest net available. That is what it is built for and Apex does not do it at all.",
      "Book scouting or Amazon flips are part of how you buy.",
      "You want the rest of the Seller 365 bundle anyway, in which case this comes with it.",
    ],
    chooseApex: [
      "You buy from wholesale price lists, and you want what clears to end in a purchase order rather than a shortlist you rekey somewhere else.",
      "You want the floor under every price computed from what the unit actually cost you, landed.",
      "You would rather the research, the buying, the pricing and the books were one system than a bundle of separate ones.",
    ],
    ctaLine:
      "Two different ways of finding stock. If yours is a supplier price list, run one through both and compare what you are left holding.",
    shotCaption: "A supplier price list, carried past the shortlist and into a purchase order.",
    sources: [
      { label: "Tactical Arbitrage in Seller 365", href: "https://www.threecolts.com/seller-365/tactical-arbitrage" },
      { label: "Threecolts Seller 365 pricing", href: "https://www.threecolts.com/seller-365" },
    ],
  },
];

export const comparisonBySlug = (slug: string): Comparison => {
  const found = COMPARISONS.find((comparison) => comparison.slug === slug);
  if (!found) throw new Error(`No comparison data for "${slug}"`);
  return found;
};
