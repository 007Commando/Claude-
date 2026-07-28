import dashboardHeroImage from "../assets/dashboard-hero.png.asset.json";
import purchaseOrdersImage from "../assets/purchase-orders.png.asset.json";
import opexDashboardImage from "../assets/opex-dashboard.png.asset.json";
import profitLossDashboardImage from "../assets/profit-loss-dashboard.png.asset.json";
import vendorsDashboardImage from "../assets/vendors-dashboard.png.asset.json";
import inventoryRestockingImage from "../assets/inventory-restocking.png.asset.json";
import upcScannerImage from "../assets/upc-scanner.png.asset.json";
import masterCatalogImage from "../assets/master-catalog.png.asset.json";
import resourceLibraryImage from "../assets/resource-library.png.asset.json";
import reviewBoosterImage from "../assets/review-booster.png.asset.json";
import apexUniversityImage from "../assets/apex-university.png.asset.json";

const amazonUngatingPortalImage = "/images/ungating-guide/amazon-ungating-portal.png";
const keepaPlaybookBookImage = "/images/fba-starter-bundle/keepa-playbook-book.png";
const apexSuiteOverviewImage = "/images/fba-starter-bundle/apex-suite-overview.png";

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | {
      type: "costChart";
      title: string;
      items: { label: string; price: number; note?: string; highlight?: boolean }[];
    };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  content: ContentBlock[];
}

export const CATEGORIES = [
  "Getting Started",
  "Ungating",
  "Product Research",
  "Operations",
  "Reviews & Feedback",
  "Logistics",
  "Profitability",
  "Business Models",
  "Software & Tools",
  "Company",
] as const;

export const posts: BlogPost[] = [
  {
    slug: "how-to-start-amazon-wholesale-2026",
    title: "How to Start Amazon Wholesale in 2026: A Step-by-Step Guide",
    description:
      "A practical, no-fluff walkthrough of starting an Amazon wholesale business in 2026 — from picking your first supplier to placing your first purchase order, with real margin benchmarks.",
    category: "Getting Started",
    publishedAt: "2026-07-01",
    readingTime: "13 min read",
    content: [
      {
        type: "p",
        text: "Amazon wholesale is still one of the most repeatable ways to build a real e-commerce business, because you're selling products that already have proven demand instead of gambling on something brand new. The tradeoff is that it rewards process more than instinct: sellers who win are the ones who source consistently, track their numbers, and move fast on approvals. Roughly 42% of wholesale sellers report getting their business off the ground in under six weeks — not because they got lucky, but because they followed a sequence instead of improvising one. Here's that sequence, in order.",
      },
      {
        type: "stats",
        items: [
          { value: "6 weeks", label: "Typical time to launch for organized sellers" },
          { value: "10–20%", label: "Typical wholesale net margin" },
          { value: "30%+", label: "Gross margin target before fees" },
          { value: "7 days", label: "Apex free trial before you're charged" },
        ],
      },
      {
        type: "image",
        src: dashboardHeroImage.url,
        alt: "Apex dashboard showing Amazon balance, sales, and profit",
        caption: "The dashboard you'll actually be running your business from",
      },
      {
        type: "h2",
        text: "1. Register your Amazon Seller Central account correctly",
      },
      {
        type: "p",
        text: "Before you source a single product, set up a Professional Seller Central account (not Individual — you'll need the bulk listing and reporting tools it unlocks, and the $39.99/month subscription pays for itself almost immediately once you're moving any real volume). Use a dedicated business email, have your business formation documents and a voided check or bank statement ready, and expect Amazon's identity verification step to take anywhere from a few hours to a couple of weeks. Don't source inventory while this is pending; you want your account fully live before money is on the line.",
      },
      {
        type: "h3",
        text: "Sole proprietor or LLC?",
      },
      {
        type: "p",
        text: "You can technically register as a sole proprietor using your SSN, and plenty of sellers start that way. But forming an LLC before you scale past your first few thousand dollars in revenue is worth the modest cost (typically $50–$500 depending on state) for the liability separation alone — a product recall or a customer injury claim shouldn't be able to reach your personal assets.",
      },
      {
        type: "h2",
        text: "2. Find your first authorized distributor",
      },
      {
        type: "p",
        text: "Wholesale means buying directly from brands or their authorized distributors at wholesale cost, then reselling at retail. The fastest path to your first supplier isn't cold-emailing brands blind — it's starting with distributors who already carry multiple brands you could resell, since one relationship can open dozens of products at once. This is exactly the shortcut Apex hands you on signup: every [new account gets 3 free, vetted, authorized US wholesale distributors](/auth?mode=signup&plan=starter&period=monthly), so you skip the weeks most new sellers spend just finding someone who will sell to them.",
      },
      {
        type: "image",
        src: vendorsDashboardImage.url,
        alt: "Apex Blue Vendors tool showing top suppliers, total spend, and supplier lead times",
        caption: "Apex Blue's Vendors tool — organize every supplier, lead time, and dollar spent in one place",
      },
      {
        type: "h3",
        text: "What to ask a distributor before you commit",
      },
      {
        type: "ul",
        items: [
          "Are you an authorized distributor for the brands you're offering, or a reseller yourself? (You need the former.)",
          "What's your minimum order quantity and minimum opening order?",
          "Can you provide an invoice with your business name, the brand name, and itemized UPCs? You'll need this for ungating.",
          "Do you offer net payment terms, or is it prepay only for a new account?",
          "How often is your price list updated, and will you notify me before a price increase?",
        ],
      },
      {
        type: "h2",
        text: "3. Vet the product list before you buy anything",
      },
      {
        type: "p",
        text: "A distributor's price list might have 500 SKUs on it. Maybe 20 are worth your money. Before placing an order, check three things for every candidate product: the sales rank trend over the past 90 days (steady or growing, not declining), the number of other sellers on the listing (fewer competitors on the buy box means more margin), and whether the category or brand requires approval to sell. This is where a Keepa-reading habit pays for itself — see our [guide on reading Keepa charts for wholesale](/blog/reading-keepa-charts-wholesale) for the exact framework.",
      },
      {
        type: "image",
        src: upcScannerImage.url,
        alt: "Apex Green UPC Scanner showing landed cost, ROI, margin, and Amazon fees for a distributor price list",
        caption: "Apex Green's UPC Scanner — scan an entire distributor price list and see margin per SKU instantly",
      },
      {
        type: "p",
        text: "When you're scanning a distributor's full catalog rather than one product at a time, a master catalog tool that merges every supplier's price list into one searchable database saves hours — this is exactly what Apex Green's Master Catalog does once you've got more than one or two suppliers on file.",
      },
      {
        type: "image",
        src: masterCatalogImage.url,
        alt: "Apex Green Master Catalog merging multiple supplier price lists with unit cost and case pack data",
        caption: "Apex Green's Master Catalog — every supplier's UPCs, unit costs, and case packs in one searchable database",
      },
      {
        type: "h2",
        text: "What profit margin should you actually expect?",
      },
      {
        type: "p",
        text: "This is the question most \"how to start\" guides skip, and it's the one that determines whether your business actually works. Wholesale sellers typically land in the 10–20% net margin range — thinner per unit than private label, but far more repeatable because you're not betting on a new product's demand. As a rule of thumb, aim for at least 30% gross margin before Amazon and shipping fees when evaluating a product, since fees alone typically eat 15–25% of the sale price before you've paid for the product itself.",
      },
      {
        type: "table",
        headers: ["Margin range", "What it means"],
        rows: [
          ["25%+ net", "Excellent — hold onto this SKU and consider reordering deeper."],
          ["15–25% net", "Good, sustainable range for most wholesale products."],
          ["10–15% net", "Workable if velocity is high, but leaves little room for fee increases."],
          ["Under 8% net", "Warning zone — a single price war or fee hike can push this negative."],
        ],
      },
      {
        type: "p",
        text: "We go much deeper on this in our [profit margins deep-dive](/blog/amazon-wholesale-profit-margins-2026), including the margin killers most new sellers forget to budget for.",
      },
      {
        type: "h2",
        text: "4. Get ungated before you place a real order",
      },
      {
        type: "p",
        text: "Many of the best wholesale categories — Grocery, Beauty, Health & Personal Care — are gated, meaning Amazon requires an application and an invoice before you can list. Submit your [ungating application](/ungating-guide) using the distributor invoice you collected in step 2 as soon as you know which products you want, not after the inventory arrives. Approval can take anywhere from a few minutes to a few days, and there's no reason to have cash tied up in boxes you can't list yet. Amazon rejects roughly 70% of first-time DIY ungating attempts over invoice formatting issues alone — our [full ungating guide](/blog/amazon-ungating-guide-2026) covers exactly what a passing invoice needs.",
      },
      {
        type: "h2",
        text: "5. Place your first purchase order — and track it properly",
      },
      {
        type: "p",
        text: "Your first PO should be small: enough to test real sell-through, not so much that a slow mover ties up your capital for months. Track the order, the landed cost per unit (product cost plus shipping plus any prep fees), and the date it hits Amazon's warehouse. This sounds obvious until you're managing your fifth supplier and your twentieth SKU on a spreadsheet that's three tabs deep — which is the exact point where most sellers start losing track of margin.",
      },
      {
        type: "image",
        src: purchaseOrdersImage.url,
        alt: "Apex Blue Purchase Orders tool showing margin, ROI, revenue, and expense projections per supplier",
        caption: "Apex Blue's Purchase Orders — real margin and ROI per order, not a guess after the fact",
      },
      {
        type: "p",
        text: "[Apex Blue's](/features/blue) purchase order and Opex tools exist specifically for this stage, so your real profit per unit is visible the moment inventory lands, not two months later when you're reconciling a mess. See our [complete purchase order workflow guide](/blog/amazon-purchase-order-workflow) for the full process.",
      },
      {
        type: "h2",
        text: "6. Get your prep center lined up before inventory ships",
      },
      {
        type: "p",
        text: "Unless you're prepping and labeling out of your own garage, you need a prep center in place before your first shipment leaves the distributor's warehouse — not after it's already in transit with nowhere to go. Compare a few options on cost per unit, turnaround time, and communication before you commit. Our [guide on choosing a prep center for Amazon FBA wholesale](/blog/choosing-a-prep-center-amazon-fba) walks through exactly what to check, and Apex members get member pricing across a [vetted network of US prep centers](/prep-center-network).",
      },
      {
        type: "h2",
        text: "Common first-timer mistakes",
      },
      {
        type: "ul",
        items: [
          "Ordering too deep on an unproven SKU — start small, reorder once velocity is confirmed.",
          "Sourcing from a retailer (Costco, Sam's Club) instead of an authorized distributor — this invoice will almost always fail ungating.",
          "Skipping the landed-cost math and pricing off unit cost alone — shipping and prep fees are not small once you total them.",
          "Not lining up a prep center until after inventory ships, leaving boxes with nowhere to go.",
          "Treating the first PO as a one-time task instead of setting a reorder trigger before you go out of stock.",
        ],
      },
      {
        type: "h2",
        text: "The real difference between sellers who scale and sellers who stall",
      },
      {
        type: "p",
        text: "It's rarely a bad first product. It's almost always a broken process: no system for tracking POs, no repeatable way to find new suppliers, no visibility into real margin until it's too late to fix. [Apex Black](/features/black), [Blue](/features/blue), [Green](/features/green), and [Red](/features/red) exist to cover exactly those four gaps — dashboard and education, financial analytics and purchasing, sourcing and product research, and logistics — as one connected suite instead of five disconnected spreadsheets and subscriptions. Apex Black also ships with a complete library of tactical playbooks — wholesale blueprint, distributor outreach scripts, negotiation guide, ungating SOP, and more — a $300 value included free with every account.",
      },
      {
        type: "image",
        src: resourceLibraryImage.url,
        alt: "Apex University Complete Playbook Library with 10 tactical playbooks for Amazon wholesale",
        caption: "Apex University's Playbook Library — 10 tactical playbooks, a $300 value, included with every account",
      },
      {
        type: "image",
        src: apexUniversityImage.url,
        alt: "Apex University course modules for Amazon wholesale education",
        caption: "Apex University's course modules — the education layer behind the playbooks",
      },
      {
        type: "p",
        text: "If you're also weighing wholesale against private label or retail arbitrage, see our [business model comparison](/blog/amazon-wholesale-vs-private-label-vs-retail-arbitrage) — and if you're wondering what a realistic starting budget looks like, we broke that down in [how much it actually costs to start](/blog/how-much-does-it-cost-to-start-amazon-wholesale-2026).",
      },
    ],
  },
  {
    slug: "amazon-ungating-guide-2026",
    title: "How to Get Ungated on Amazon Faster (Without Guessing)",
    description:
      "Why Amazon gates certain categories, what actually gets an ungating application approved, and how to avoid the invoice mistakes behind a 70% first-attempt rejection rate.",
    category: "Ungating",
    publishedAt: "2026-07-08",
    readingTime: "10 min read",
    content: [
      {
        type: "p",
        text: "Gating exists to keep counterfeit and unauthorized inventory off Amazon, not to keep small sellers out. Once you understand what Amazon's review team is actually checking for, ungating stops being a mystery and becomes a checklist. Here's what actually moves an application from pending to approved — and why Amazon rejects an estimated 70% of first-time DIY attempts.",
      },
      {
        type: "image",
        src: amazonUngatingPortalImage,
        alt: "Amazon Seller Central ungating application portal",
        caption: "The real Amazon Seller Central ungating application screen",
      },
      {
        type: "stats",
        items: [
          { value: "~70%", label: "Of first-time DIY ungating attempts get rejected" },
          { value: "10 units", label: "Minimum quantity most invoices need to show" },
          { value: "90–180 days", label: "Invoice must typically fall within this window" },
        ],
      },
      {
        type: "h2",
        text: "Why a category or brand gets gated in the first place",
      },
      {
        type: "p",
        text: "Amazon restricts categories with a high history of counterfeit complaints (Grocery, Beauty, Health & Personal Care), safety concerns (Topicals, Supplements), or brands that have specifically requested restricted distribution (most name-brand electronics and many CPG brands). The common thread: Amazon wants proof that whatever you're about to list is coming from a legitimate, traceable supply chain — not proof that you're a big seller.",
      },
      {
        type: "h2",
        text: "Which categories are commonly gated in 2026",
      },
      {
        type: "ul",
        items: [
          "Grocery & Gourmet Food — high opportunity, consistent repeat demand, moderate approachability.",
          "Beauty and Health & Personal Care — strict due to safety and counterfeit history.",
          "Topicals and Supplements — require additional compliance documentation on top of an invoice.",
          "Jewelry and Watches — brand-specific restrictions are common here.",
          "Automotive & Powersports parts — often requires a certificate of authenticity from the manufacturer.",
        ],
      },
      {
        type: "h2",
        text: "The one document that decides most applications: your invoice",
      },
      {
        type: "p",
        text: "Amazon's ungating review is almost entirely invoice-based. A strong invoice has your registered business name, the supplier's business name and contact information, the brand name as it appears on Amazon, matching UPCs for each product, and a purchase quantity that looks like a real wholesale order rather than a single retail purchase — most reviewers want to see at least 10 units per SKU, dated within roughly the last 90 to 180 days. A blurry photo of a handwritten receipt, or an invoice from a retailer like Costco or Sam's Club, will almost always get rejected — Amazon wants an authorized distributor or the brand itself, not a retail purchase.",
      },
      {
        type: "table",
        headers: ["Invoice must show", "Why it matters"],
        rows: [
          ["Your exact Seller Central business name", "A mismatch is the single most common cause of rejection."],
          ["Supplier's business name, address, and contact info", "Proves the source is a real, traceable business."],
          ["Brand name matching the Amazon listing exactly", "Confirms you're sourcing the actual brand, not a lookalike."],
          ["Matching UPCs for each product", "Ties the invoice directly to the ASIN you're applying against."],
          ["10+ units per SKU, dated within ~90–180 days", "Signals a real wholesale purchase, not a one-off retail buy."],
        ],
      },
      {
        type: "h3",
        text: "Common rejection reasons — and how to avoid each one",
      },
      {
        type: "ul",
        items: [
          "Invoice doesn't match your Seller Central business name exactly — register with a distributor using the same legal name on file with Amazon.",
          "UPCs on the invoice don't match the ASIN you're applying against — double-check before submitting, one mismatch can sink the whole application.",
          "Quantity looks like a retail purchase, not wholesale — most reviewers want to see at least 10 units per SKU, not a single unit.",
          "Invoice is too old — stay inside the roughly 90–180 day window most categories expect.",
          "Supplier isn't an authorized distributor for that brand — ask for proof of authorization before you buy, not after you're rejected.",
        ],
      },
      {
        type: "h2",
        text: "A faster path: start with pre-vetted suppliers",
      },
      {
        type: "p",
        text: "The single biggest time-saver in ungating isn't a better application template — it's starting with suppliers who are already known to produce invoices that pass. This is why sourcing from authorized distributors matters more than chasing the cheapest price list you can find. It's also the exact reason Apex hands every [new account 3 free, vetted, authorized US wholesale distributors](/auth?mode=signup&plan=starter&period=monthly) on signup: you're not gambling on whether the invoice will hold up.",
      },
      {
        type: "h2",
        text: "Our real step-by-step for the Grocery category",
      },
      {
        type: "p",
        text: "Grocery is one of the highest-opportunity gated categories in wholesale — consistent repeat demand, less price erosion than trend-driven categories — and one of the more approachable ones to get ungated in once you have the right invoice. We wrote a full walkthrough with real screenshots covering the exact steps, from finding the application inside Seller Central to what a passing invoice actually looks like, in our [ungating guide](/ungating-guide).",
      },
      {
        type: "h2",
        text: "What to do if you get rejected",
      },
      {
        type: "p",
        text: "A rejection isn't final — it's feedback. Read the rejection reason carefully (Amazon usually tells you exactly what was missing), fix that specific gap, and reapply. Don't reapply with the same invoice hoping for a different reviewer; fix the actual issue first. Most second attempts succeed once the real problem — usually a name mismatch or an unauthorized supplier — is corrected. Apex University's playbook library includes a dedicated Ungating SOP and template Authorization Letter you can lean on when a category asks for more than a standard invoice.",
      },
      {
        type: "p",
        text: "Once you're ungated and sourcing real inventory, the next bottleneck is usually vetting which of the newly-unlocked products are actually worth a purchase order — our [Keepa reading framework](/blog/reading-keepa-charts-wholesale) covers that next step.",
      },
    ],
  },
  {
    slug: "reading-keepa-charts-wholesale",
    title: "Reading Keepa Charts for Wholesale: A Practical Framework",
    description:
      "How to read a Keepa chart in under a minute and decide whether a product is actually worth a wholesale purchase order — plus the mistakes that lead to bad POs.",
    category: "Product Research",
    publishedAt: "2026-07-13",
    readingTime: "10 min read",
    content: [
      {
        type: "p",
        text: "Keepa is the single most useful tool in wholesale sourcing, and also the one most new sellers misread. A chart full of colored lines looks intimidating until you know which three lines actually matter for a wholesale buying decision. Here's the framework.",
      },
      {
        type: "image",
        src: keepaPlaybookBookImage,
        alt: "Apex Keepa Playbook cover",
        caption: "Apex University's Keepa Playbook — the framework below, expanded with real chart walkthroughs",
      },
      {
        type: "h2",
        text: "The three lines that matter (ignore the rest at first)",
      },
      {
        type: "ul",
        items: [
          "Sales Rank (orange) — lower is better, and what matters most is the trend, not the absolute number.",
          "Buy Box Price (pink/purple) — shows what the product has actually sold for over time, not just the current list price.",
          "Offer Count (yellow, or the number in the New Offer Count row) — how many sellers are competing for the buy box right now.",
        ],
      },
      {
        type: "p",
        text: "Everything else — Amazon's own price line, used offers, the Sales Rank drops chart — is useful once you're advanced, but these three lines alone are enough to make a solid go/no-go call on 90% of products.",
      },
      {
        type: "h2",
        text: "Step 1: Check the sales rank trend, not the snapshot",
      },
      {
        type: "p",
        text: "A single sales rank number tells you almost nothing — a rank of 5,000 could mean a hot seller or a product that spiked once and has been dead for months. Set the Keepa chart to a 90-day or 1-year view instead. You're looking for a rank that oscillates in a consistent, predictable range (healthy, ongoing demand) rather than one that trends steadily upward over time, which usually means the product is dying.",
      },
      {
        type: "h3",
        text: "Reading the Sales Rank Drops chart (once you're past the basics)",
      },
      {
        type: "p",
        text: "Keepa's Sales Rank Drops view counts how many times a product's rank suddenly jumped upward (a proxy for a sale). It's not a precise unit-sales counter — treat it as a directional signal, not a guarantee — but a product with frequent, evenly-spaced drops is a much stronger candidate than one with a single big spike months ago and silence since. The exact conversion from rank to monthly units varies significantly by category and season, so use this to compare candidates against each other rather than to forecast an exact number.",
      },
      {
        type: "h2",
        text: "Step 2: Check how stable the buy box price has actually been",
      },
      {
        type: "p",
        text: "A price line that's flat for months is a good sign — it means the market has settled and sellers aren't racing each other to the bottom. A price line that's been sawtoothing downward over the past 90 days usually means a price war is underway, and by the time your inventory lands, the margin you modeled today may not exist anymore. This single check prevents more bad purchase orders than any other step in this framework.",
      },
      {
        type: "h2",
        text: "Step 3: Count the competition on the offer",
      },
      {
        type: "p",
        text: "More sellers on a listing means more buy-box rotation and thinner margins per unit, even if the product itself sells well. As a rough starting filter for wholesale (not a hard rule): under 5 other sellers is comfortable, 5–10 requires a real pricing and velocity advantage to be worth it, and 10+ usually means you need a genuinely differentiated angle (exclusive distribution, a bundle, or being meaningfully cheaper) to make it worth a purchase order.",
      },
      {
        type: "h2",
        text: "Putting it together: a 60-second product check",
      },
      {
        type: "ol",
        items: [
          "Open the Keepa chart, switch to 90-day or 1-year view.",
          "Sales rank: is it a healthy, consistent range, or trending upward (dying)?",
          "Buy box price: has it been flat/stable, or dropping (price war)?",
          "Offer count: how many sellers are actually competing for this buy box?",
          "If all three check out, run the real landed-cost math before committing to a purchase order.",
        ],
      },
      {
        type: "image",
        src: upcScannerImage.url,
        alt: "Apex Green UPC Scanner showing landed cost, ROI, and margin next to sales price history for each product",
        caption: "Running the landed-cost math after a Keepa check — Apex Green's UPC Scanner",
      },
      {
        type: "h2",
        text: "Common Keepa reading mistakes new wholesale sellers make",
      },
      {
        type: "ul",
        items: [
          "Judging a product off the current sales rank alone, without checking the trend over 90 days.",
          "Ignoring the buy box price history and pricing purely off today's number.",
          "Not accounting for seasonality — a rank that looks great in November may be a normal Q4 spike, not year-round demand.",
          "Treating offer count as the only competition signal, while ignoring whether one seller dominates the buy box rotation.",
        ],
      },
      {
        type: "h2",
        text: "Where this fits into a bigger sourcing system",
      },
      {
        type: "p",
        text: "Keepa answers whether a specific product looks healthy. It doesn't answer whether you can actually get authorized to sell it, or whether the supplier's price leaves you real margin after prep and fees — that's a broader sourcing workflow, which is exactly what [Apex Green's](/features/green) Master Catalog and UPC Scanner are built to speed up once you've got a Keepa-vetted product list to check against real supplier catalogs.",
      },
      {
        type: "quote",
        text: "The goal of a Keepa check isn't certainty — it's filtering out the obviously bad candidates fast enough that you spend your real diligence time on the products that deserve it.",
      },
      {
        type: "p",
        text: "Once a product clears all three checks, the next step is turning it into a real purchase order — see our [complete purchase order workflow guide](/blog/amazon-purchase-order-workflow) for how to do that without losing track of margin.",
      },
    ],
  },
  {
    slug: "amazon-purchase-order-workflow",
    title: "Amazon FBA Purchase Orders: The Complete Workflow Guide",
    description:
      "A repeatable purchase order workflow for Amazon wholesale sellers — from deciding order quantity to reconciling what actually landed against what you paid for, with a real landed-cost example.",
    category: "Operations",
    publishedAt: "2026-07-16",
    readingTime: "11 min read",
    content: [
      {
        type: "p",
        text: "Most wholesale sellers don't lose margin on a bad product — they lose it on a messy purchase order process. Late reorders, mismatched invoices, and prep fees nobody tracked until month-end all quietly eat profit that looked fine on paper. Here's a workflow that closes those gaps.",
      },
      {
        type: "image",
        src: purchaseOrdersImage.url,
        alt: "Apex Blue Purchase Orders dashboard with average sale price, margin, ROI, and per-supplier order breakdown",
        caption: "Apex Blue's Purchase Orders — margin and ROI calculated automatically, per supplier and per order",
      },
      {
        type: "h2",
        text: "1. Decide order quantity based on real velocity, not gut feel",
      },
      {
        type: "p",
        text: "For a brand-new SKU, order enough to get a genuine read on sell-through — typically a 30 to 45 day supply based on your Keepa-informed estimate, not a full pallet on a hunch. For a reorder on a proven SKU, base the quantity on your actual trailing 30-day sales velocity plus supplier lead time, so you're not stocking out while a reorder is in transit, but also not tying up six months of cash in one SKU.",
      },
      {
        type: "h2",
        text: "2. Confirm pricing and terms before you submit the PO",
      },
      {
        type: "p",
        text: "Wholesale price lists change. Before submitting a purchase order, confirm current unit cost, any volume break pricing you qualify for, and payment terms (prepay vs. net-30) directly with the supplier — don't work off a price list that's more than a few weeks old. This single confirmation step avoids the single most common margin surprise: paying more than you modeled because the price quietly moved.",
      },
      {
        type: "h2",
        text: "3. Track the PO from submission through landing",
      },
      {
        type: "p",
        text: "A purchase order isn't done when you submit it — it's done when the inventory is checked in at your prep center or Amazon's warehouse and matches what you ordered. In between, track the order date, expected ship date, and expected landing date. This is the stage where a spreadsheet starts to break down once you're running more than two or three suppliers at once, because there's no single view of what's outstanding versus what's landed. [Apex Blue's](/features/blue) purchase order tooling exists specifically to keep this in one place instead of scattered across supplier emails and separate trackers.",
      },
      {
        type: "h2",
        text: "4. A real landed cost example",
      },
      {
        type: "p",
        text: "Your real cost per unit is the product cost plus inbound shipping, plus prep center fees, plus any FBA prep requirements (poly bagging, labeling) plus Amazon's referral and fulfillment fees — not just the number on the supplier's invoice. Here's a worked example for a hypothetical $15 sale-price product:",
      },
      {
        type: "table",
        headers: ["Cost component", "Example amount"],
        rows: [
          ["Wholesale unit cost", "$6.50"],
          ["Inbound shipping (per unit)", "$0.60"],
          ["Prep center fee (per unit)", "$0.45"],
          ["Amazon referral fee (15%)", "$2.25"],
          ["FBA fulfillment fee", "$3.80"],
          ["Total landed cost", "$13.60"],
          ["Net profit per unit", "$1.40 (9.3% margin)"],
        ],
      },
      {
        type: "p",
        text: "That 9.3% margin is in the warning zone by the benchmarks in our [profit margins guide](/blog/amazon-wholesale-profit-margins-2026) — this exact kind of math, run before the PO instead of after, is what separates a product you should pass on from one you should double down on. Sellers who only track unit cost consistently overestimate their margin, because none of the add-on costs above are small individually, but they compound fast across an order of a few hundred units.",
      },
      {
        type: "image",
        src: opexDashboardImage.url,
        alt: "Apex Blue Opex dashboard tracking recurring monthly expenses by category",
        caption: "Apex Blue's Opex tool — every recurring cost in one place, so margin math accounts for the full picture",
      },
      {
        type: "h2",
        text: "5. Reconcile what landed against what you paid for",
      },
      {
        type: "p",
        text: "When inventory arrives at your prep center, check it against the original PO before it ships to Amazon: correct quantity, correct condition, no shortages. Purchase order discrepancies — short shipments, damaged units, wrong items — are common enough in wholesale that catching them here, before the units are checked into FBA, is far easier than disputing them after the fact.",
      },
      {
        type: "h2",
        text: "6. Track profit after the sale, not just before",
      },
      {
        type: "p",
        text: "Landed cost math tells you what you expect to make. Actual profit and loss tells you what you did make, after returns, storage fees, and any price changes since the PO went out. Reviewing both side by side, ideally on the same dashboard, is what catches a slow margin leak before it becomes a real problem.",
      },
      {
        type: "image",
        src: profitLossDashboardImage.url,
        alt: "Apex Blue Analytics Profit and Loss dashboard with gross revenue, profit, margin percent, and per-product breakdown",
        caption: "Apex Blue's Analytics — real revenue, profit, and margin %, updated automatically as orders come in",
      },
      {
        type: "h2",
        text: "7. Set a reorder trigger before you run out",
      },
      {
        type: "p",
        text: "For any SKU that's selling consistently, set a reorder point based on your supplier's actual lead time — inventory level at which you place the next PO so a new shipment lands before you go out of stock. Amazon punishes stockouts hard: you lose sales velocity, which can hurt your organic ranking even after you're restocked.",
      },
      {
        type: "image",
        src: inventoryRestockingImage.url,
        alt: "Apex inventory analytics showing stock value, items to restock, and days until next order",
        caption: "Real-time inventory and restock alerts, so reorder points aren't a guess",
      },
      {
        type: "p",
        text: "Real-time visibility into current inventory across every prep center and warehouse is exactly what [Apex Red's](/features/red) inventory tools are built to give you, so reorder points aren't a guess.",
      },
      {
        type: "h2",
        text: "Why this workflow matters more as you scale",
      },
      {
        type: "p",
        text: "With one supplier and five SKUs, you can run this in your head. With eight suppliers and eighty SKUs, you can't — and the sellers who stall out at that stage are almost always the ones still trying to. A connected system across sourcing, purchasing, and inventory isn't a nice-to-have at that point; it's the difference between scaling and drowning in your own spreadsheets. See what that actually costs versus stitching together separate tools in our breakdown of [what a typical seller software stack really costs](/blog/real-cost-of-stacking-amazon-seller-software).",
      },
    ],
  },
  {
    slug: "automating-amazon-review-requests",
    title: "Automating Amazon Review Requests the Right Way",
    description:
      "How to build review velocity for new listings using Amazon-compliant automated requests, exactly what counts as compliant, and the tactics that will get your account suspended.",
    category: "Reviews & Feedback",
    publishedAt: "2026-07-20",
    readingTime: "9 min read",
    content: [
      {
        type: "p",
        text: "Reviews are the single biggest trust signal a new listing has, and also one of the easiest things to get wrong. Amazon has shut down entire seller accounts over review manipulation, so before automating anything, it's worth being precise about what's actually allowed.",
      },
      {
        type: "image",
        src: reviewBoosterImage.url,
        alt: "Apex Review Booster automation dashboard",
        caption: "Apex Black's Review Booster — neutral, automated, and built around Amazon's own compliant framework",
      },
      {
        type: "h2",
        text: "What Amazon actually prohibits",
      },
      {
        type: "ul",
        items: [
          "Offering money, free products, or discounts in exchange for a review — this is banned outright, no matter how it's worded.",
          "Asking only customers you expect to leave a positive review, or filtering out unhappy customers from requests.",
          "Reviews from friends, family, or employees, disclosed or not.",
          "Any incentive tied to leaving a positive review specifically, versus a review in general.",
        ],
      },
      {
        type: "h2",
        text: "What Amazon actually allows — and encourages",
      },
      {
        type: "p",
        text: "Amazon's own \"Request a Review\" button exists precisely because a neutral, unconditional request for feedback is fine. The rule that matters: you can ask every customer for a review, with no incentive, no cherry-picking, and no expectation management about what they should say. That's the entire compliant playbook — the only thing automation should be doing is removing the manual work of clicking that button (or sending that neutral request) for every single order, on a consistent schedule, without you having to remember to do it.",
      },
      {
        type: "h3",
        text: "Compliant request vs. what gets accounts suspended",
      },
      {
        type: "table",
        headers: ["Compliant", "Not compliant"],
        rows: [
          [
            "\"We'd love your honest feedback on your recent order.\"",
            "\"Leave us a 5-star review and get a $5 gift card.\"",
          ],
          ["Sent to every customer, every order", "Sent only to customers who didn't complain or return the item"],
          ["No incentive of any kind attached", "Free replacement or discount offered in exchange for a review"],
          ["Neutral tone, no expectation set", "\"If you're happy, please leave 5 stars!\""],
        ],
      },
      {
        type: "h2",
        text: "The timing that actually improves response rates",
      },
      {
        type: "p",
        text: "Requesting too early (before the customer has had time to use the product) or too late (after the moment has passed and the order is forgotten) both hurt response rates. For most physical products, a request timed a few days after estimated delivery — enough time to actually try the product, but while it's still top of mind — performs best. This is exactly the kind of consistent, well-timed request that's easy to design once and painful to execute manually order after order.",
      },
      {
        type: "h2",
        text: "Why review velocity matters more for new listings than old ones",
      },
      {
        type: "p",
        text: "A listing with zero reviews converts dramatically worse than one with even 10–20, regardless of price or photos — shoppers use review count as a shortcut for \"is this a real, trustworthy product.\" That makes the first few weeks after a new listing goes live the highest-leverage window for review requests, because early social proof compounds: more reviews improve conversion, which improves sales velocity, which improves organic rank, which drives more sales.",
      },
      {
        type: "h2",
        text: "Metrics worth actually tracking",
      },
      {
        type: "ul",
        items: [
          "Request send rate — what percentage of eligible orders actually got a request sent.",
          "Review velocity — new reviews per week on a given listing, especially in the first 60 days.",
          "Response rate over time — a sudden drop can flag a delivery or fulfillment issue worth investigating.",
        ],
      },
      {
        type: "h2",
        text: "How Apex approaches this",
      },
      {
        type: "p",
        text: "[Apex Black](/features/black) includes [Review Booster](/review-booster) — free for life on every plan — specifically built around Amazon's compliant request framework: neutral, unconditional, automatically timed per order, with no discounts or incentives baked in anywhere. The goal isn't to manufacture reviews; it's to make sure every legitimate customer who would have left one actually gets asked, without you manually tracking order dates in a spreadsheet.",
      },
      {
        type: "h2",
        text: "The bottom line",
      },
      {
        type: "p",
        text: "Automating review requests is safe and smart. Automating review manipulation is a fast way to lose your account. The line between them isn't subtle — it's whether you're asking everyone neutrally, or steering the outcome. Stay firmly on the first side of that line and automation is a pure win.",
      },
    ],
  },
  {
    slug: "choosing-a-prep-center-amazon-fba",
    title: "Choosing a Prep Center for Amazon FBA Wholesale: What Actually Matters",
    description:
      "The real evaluation checklist for picking an Amazon FBA prep center — cost per unit, turnaround time, communication, and the questions most sellers forget to ask.",
    category: "Logistics",
    publishedAt: "2026-07-24",
    readingTime: "9 min read",
    content: [
      {
        type: "p",
        text: "A prep center is infrastructure, not a vendor you can casually swap out mid-shipment — a bad choice shows up as stockouts, damaged inventory, or a bill that's twice what you budgeted. Here's what actually separates a good one from a bad one.",
      },
      {
        type: "h2",
        text: "1. Get real per-unit pricing, not a vague quote",
      },
      {
        type: "p",
        text: "Ask for an itemized rate sheet: receiving fee per unit or per box, labeling fee, poly bagging, bundling if you need it, storage fee per day if inventory sits, and outbound shipping to Amazon. A prep center that only gives you a single \"per unit\" number without breaking down what's included is one that's likely to surprise you with add-on fees once your first shipment lands.",
      },
      {
        type: "h2",
        text: "2. Ask about turnaround time — and get it in writing",
      },
      {
        type: "p",
        text: "Turnaround (time from receiving your inventory to shipping it out to Amazon) directly affects how fast you can restock a selling product. A prep center that says \"1-2 business days\" verbally but takes a week in practice during a busy season will cost you real sales velocity. Ask specifically what turnaround looks like during peak season (Q4), not just their best-case number.",
      },
      {
        type: "h3",
        text: "Questions worth asking before you ship a single box",
      },
      {
        type: "ul",
        items: [
          "What's your average turnaround time, and what does it look like during Q4?",
          "How do you communicate discrepancies — short shipments, damaged units — and how fast?",
          "Do you offer real-time inventory visibility, or do I have to email to check on a shipment?",
          "What's your process if Amazon rejects a shipment or requires relabeling?",
          "Can you handle bundling, if I ever need it for a multi-pack listing?",
        ],
      },
      {
        type: "table",
        headers: ["Evaluation criteria", "What good looks like", "Red flag"],
        rows: [
          ["Pricing", "Itemized rate sheet, no surprise add-ons", "Single vague \"per unit\" quote"],
          ["Turnaround", "1–2 days, holds up during Q4", "Verbal promise only, no written SLA"],
          ["Communication", "Fast, proactive on discrepancies", "Slow replies, has to be chased"],
          ["Visibility", "Real-time inventory dashboard", "Have to email to check status"],
          ["Location", "Near your primary fulfillment region", "Far enough to add real transit time/cost"],
        ],
      },
      {
        type: "h2",
        text: "3. Test communication before you commit real inventory",
      },
      {
        type: "p",
        text: "Send a real question before your first shipment and see how fast and how clearly they respond. A prep center you can't get a straight answer from during the sales process will be far worse once you actually have inventory sitting with them and a problem to resolve. This is the single most underrated evaluation criterion — most prep center failures aren't about price, they're about a black hole of communication when something goes wrong.",
      },
      {
        type: "h2",
        text: "4. Location matters more than people expect",
      },
      {
        type: "p",
        text: "A prep center closer to your primary Amazon fulfillment region cuts inbound shipping time and cost. It's not the deciding factor on its own, but between two otherwise-comparable options, geography is a real tiebreaker — especially once you're shipping frequently enough that shaving a few days off transit time compounds across dozens of shipments a year.",
      },
      {
        type: "h2",
        text: "5. Start small before you scale the relationship",
      },
      {
        type: "p",
        text: "Send a smaller first shipment to any new prep center, even one that comes highly recommended, and see how it's actually handled end to end before routing your full volume through them. It costs a little in efficiency upfront and saves a lot if something about the fit isn't right.",
      },
      {
        type: "h2",
        text: "Skipping the vetting process entirely",
      },
      {
        type: "p",
        text: "Evaluating prep centers cold takes real time — reference checks, sample shipments, rate comparisons. Apex members get a shortcut: the [Prep Center Network](/prep-center-network) is a vetted list of US prep centers with negotiated member pricing, so the reference-checking work is already done before you ever request a quote. Once your prep flow is solid, the next lever is making sure you never miss a reorder window — see our [purchase order workflow guide](/blog/amazon-purchase-order-workflow) for how to set that up.",
      },
    ],
  },
  {
    slug: "amazon-wholesale-profit-margins-2026",
    title: "Amazon Wholesale Profit Margins in 2026: What's Actually Realistic",
    description:
      "Real benchmarks for Amazon wholesale margins in 2026, the margin killers nobody budgets for, and how to calculate your true landed-cost margin before you commit to a purchase order.",
    category: "Profitability",
    publishedAt: "2026-07-27",
    readingTime: "10 min read",
    content: [
      {
        type: "p",
        text: "Margin is the number that actually decides whether a wholesale business works, and it's also the number most new sellers get wrong — usually by pricing off unit cost alone and forgetting everything else that eats into it between the purchase order and the sale. Here's what's realistic in 2026, and how to calculate yours honestly.",
      },
      {
        type: "stats",
        items: [
          { value: "10–20%", label: "Typical wholesale net margin" },
          { value: "30%+", label: "Gross margin target before fees" },
          { value: "15–25%", label: "What's considered a good net margin" },
          { value: "<8%", label: "Warning zone — a fee hike can push this negative" },
        ],
      },
      {
        type: "h2",
        text: "How margin compares across business models",
      },
      {
        type: "table",
        headers: ["Model", "Typical gross margin", "Typical net margin", "Why"],
        rows: [
          ["Wholesale", "30%+ target", "10–20%", "Proven demand, thinner per-unit margin, but repeatable volume"],
          ["Private Label", "40–60%+", "20–35%", "Full brand/pricing control, higher upside, higher upfront risk"],
          ["Retail/Online Arbitrage", "20–40%", "10–20%", "Low upfront cost, harder to scale, sourcing is time-intensive"],
        ],
      },
      {
        type: "p",
        text: "We go deeper on which model actually fits your situation in our [wholesale vs. private label vs. arbitrage comparison](/blog/amazon-wholesale-vs-private-label-vs-retail-arbitrage).",
      },
      {
        type: "h2",
        text: "How to actually calculate your real margin",
      },
      {
        type: "p",
        text: "Real margin is: (sale price minus total landed cost) divided by sale price. Total landed cost is everything it costs to get one unit sold and delivered — not just what the supplier charged you.",
      },
      {
        type: "ol",
        items: [
          "Start with the wholesale unit cost from your supplier invoice.",
          "Add inbound shipping cost, divided across the units in that shipment.",
          "Add prep center fees per unit (receiving, labeling, poly bagging).",
          "Add Amazon's referral fee (typically 8–15% of sale price depending on category) and FBA fulfillment fee.",
          "Subtract that total landed cost from your sale price, then divide by sale price for your real margin %.",
        ],
      },
      {
        type: "p",
        text: "We walk through a full worked example with real numbers in our [purchase order workflow guide](/blog/amazon-purchase-order-workflow) — it's worth running before every PO, not just once per product.",
      },
      {
        type: "image",
        src: profitLossDashboardImage.url,
        alt: "Apex Blue Analytics Profit and Loss dashboard showing margin percent and ROI across products",
        caption: "Margin and ROI calculated automatically per product — Apex Blue's Analytics dashboard",
      },
      {
        type: "h2",
        text: "The margin killers nobody budgets for",
      },
      {
        type: "ul",
        items: [
          "Long-term storage fees — inventory that sits past 365 days incurs steep additional charges, quietly turning a healthy margin negative.",
          "Returns and refunds — factor an expected return rate into your margin model, especially for apparel-adjacent or fragile categories.",
          "Ad spend — if you're running PPC to support a listing, that cost has to come out of margin somewhere.",
          "Price wars — a Keepa chart showing a stable buy box price today doesn't guarantee it stays stable through your inventory's full sell-through window.",
          "The software stack itself — subscriptions for sourcing, analytics, and inventory tools are a real recurring cost most sellers don't line-item until it's too late. We broke down what a typical stack actually costs in [our software cost comparison](/blog/real-cost-of-stacking-amazon-seller-software).",
        ],
      },
      {
        type: "image",
        src: opexDashboardImage.url,
        alt: "Apex Blue Opex dashboard tracking recurring monthly expenses",
        caption: "Every recurring cost — software included — tracked in one place",
      },
      {
        type: "h2",
        text: "When a \"good deal\" isn't",
      },
      {
        type: "p",
        text: "A product priced well below competitors on the buy box can look like an obvious win until you run the full landed-cost math and realize the margin is thinner than a product at a higher unit cost but lower fees or shipping weight. Always compare full landed-cost margin, never just unit cost against sale price — it's the difference between a spreadsheet that looks good and a business that actually is.",
      },
    ],
  },
  {
    slug: "how-much-does-it-cost-to-start-amazon-wholesale-2026",
    title: "How Much Does It Cost to Start an Amazon Wholesale Business in 2026",
    description:
      "A realistic startup budget for Amazon wholesale in 2026 — Seller Central fees, first inventory order, prep costs, software, and where new sellers typically overspend or underspend.",
    category: "Getting Started",
    publishedAt: "2026-07-27",
    readingTime: "8 min read",
    content: [
      {
        type: "p",
        text: "\"How much do I need to start?\" is one of the most common questions in Amazon wholesale, and the honest answer is a range, not a single number — it depends heavily on how deep your first purchase order is. Here's a realistic breakdown for a cautious, well-run start.",
      },
      {
        type: "stats",
        items: [
          { value: "$1,000–$3,000", label: "Typical starter budget for a first PO plus fees" },
          { value: "$39.99/mo", label: "Amazon Professional Seller subscription" },
          { value: "$50–$500", label: "LLC formation, if you choose to form one" },
        ],
      },
      {
        type: "h2",
        text: "The real startup cost breakdown",
      },
      {
        type: "table",
        headers: ["Cost", "Typical range", "Notes"],
        rows: [
          ["Amazon Professional Seller account", "$39.99/month", "Required for bulk listing and wholesale-level tools"],
          ["First purchase order (inventory)", "$500–$3,000", "Keep it small on unproven SKUs; scale once velocity is confirmed"],
          ["Prep center setup / first shipment", "$0.50–$2 per unit", "Varies by service level; get an itemized rate sheet"],
          ["Business formation (LLC, optional)", "$50–$500", "Varies by state; worth it once you're past a few thousand in revenue"],
          ["Software stack", "$0–$300+/month", "See our full breakdown of what this typically costs"],
        ],
      },
      {
        type: "p",
        text: "The software line is the one that varies most, and it's easy to underestimate — most sellers end up stacking 3-4 separate subscriptions for sourcing, analytics, and inventory before realizing what that actually adds up to. We broke down real, current pricing in [the real cost of stacking Amazon seller software](/blog/real-cost-of-stacking-amazon-seller-software).",
      },
      {
        type: "h2",
        text: "Where new sellers overspend",
      },
      {
        type: "ul",
        items: [
          "Ordering too deep on a first PO before velocity is proven — cash tied up in slow-moving inventory is the most common early mistake.",
          "Paying for premium tiers of research tools before there's enough volume to justify them.",
          "Overbuying packaging or branding materials for a wholesale business, where the product ships in the manufacturer's original packaging anyway.",
        ],
      },
      {
        type: "h2",
        text: "Where cutting corners actually costs more later",
      },
      {
        type: "ul",
        items: [
          "Skipping an LLC too long — the liability exposure isn't worth the small savings once real revenue is flowing.",
          "Choosing a prep center purely on lowest price without checking turnaround time — a slow prep center costs you in lost sales velocity.",
          "Not tracking landed cost properly from day one — the habit is much harder to build after month six than after week one.",
        ],
      },
      {
        type: "image",
        src: apexSuiteOverviewImage,
        alt: "Apex dashboard showing the Tools menu with Apex Black, Blue, and Green modules",
        caption: "A connected suite instead of a stack of separate subscriptions",
      },
      {
        type: "p",
        text: "For the full step-by-step of what to actually do with that starting budget, see our [complete guide to starting Amazon wholesale in 2026](/blog/how-to-start-amazon-wholesale-2026).",
      },
    ],
  },
  {
    slug: "amazon-wholesale-vs-private-label-vs-retail-arbitrage",
    title: "Amazon Wholesale vs Private Label vs Retail Arbitrage: Which Business Model Fits You",
    description:
      "An honest comparison of the three main ways to sell on Amazon — startup capital, time to first sale, margin, scalability, and who each model actually fits.",
    category: "Business Models",
    publishedAt: "2026-07-27",
    readingTime: "9 min read",
    content: [
      {
        type: "p",
        text: "Every new Amazon seller eventually asks the same question: wholesale, private label, or arbitrage? Each is a legitimate business, and each fits a different starting point, risk tolerance, and time budget. Here's an honest breakdown of the tradeoffs.",
      },
      {
        type: "table",
        headers: ["Factor", "Wholesale", "Private Label", "Retail/Online Arbitrage"],
        rows: [
          ["Startup capital", "Moderate ($1,000–$3,000+)", "Higher ($3,000–$10,000+)", "Low ($200–$1,000)"],
          ["Time to first sale", "Fast — proven products", "Slow — product development + launch", "Fastest — buy and list immediately"],
          ["Typical net margin", "10–20%", "20–35%", "10–20%"],
          ["Scalability", "High — reorder proven SKUs", "High — but each SKU is a new bet", "Limited — sourcing time caps volume"],
          ["Brand control", "None — reselling existing brands", "Full — you own the brand", "None"],
          ["Main risk", "Price wars, thin per-unit margin", "Product doesn't sell, inventory risk", "Sourcing doesn't scale, IP/gating issues"],
        ],
      },
      {
        type: "h2",
        text: "Amazon Wholesale",
      },
      {
        type: "p",
        text: "You buy existing, proven products directly from brands or authorized distributors and resell them. The upside is demand risk is largely solved before you spend a dollar — you're not guessing whether a product will sell, Keepa already tells you. The tradeoff is margin per unit is thinner than private label, and you're competing with other authorized sellers on the same listing. This is the model our [starter guide](/blog/how-to-start-amazon-wholesale-2026) walks through in full.",
      },
      {
        type: "h2",
        text: "Private Label",
      },
      {
        type: "p",
        text: "You develop your own branded version of a product, usually through a manufacturer, and own the listing outright — no competing sellers on your buy box. Margins are typically higher because you set the price with no direct competition on the exact SKU, but you're carrying real demand risk: if the product doesn't resonate, that inventory is much harder to liquidate than a proven wholesale SKU. This model rewards sellers with more starting capital and more risk tolerance.",
      },
      {
        type: "h2",
        text: "Retail and Online Arbitrage",
      },
      {
        type: "p",
        text: "You buy discounted or clearance products from retail stores or other online retailers and resell them on Amazon at a markup. The barrier to entry is the lowest of the three — you can start with a few hundred dollars — but it's the hardest to scale, since sourcing is manual and time-intensive by nature, and some brands actively restrict resale of retail-sourced inventory, which can complicate ungating.",
      },
      {
        type: "h2",
        text: "Which one actually fits you",
      },
      {
        type: "ul",
        items: [
          "Want the fastest, most predictable path to consistent revenue with moderate starting capital? Wholesale.",
          "Have more capital, more patience, and want to build something you fully own? Private label.",
          "Have very little starting capital and time to source manually, and want to start today? Arbitrage.",
          "Not sure? Wholesale is the most common starting point precisely because it de-risks the hardest part — knowing whether a product will actually sell — before you commit real money.",
        ],
      },
      {
        type: "p",
        text: "Whichever model you choose, the operational backbone — purchase orders, supplier relationships, inventory, and margin tracking — is the same problem to solve. That's exactly what [Apex Black, Blue, Green, and Red](/) are built around.",
      },
    ],
  },
  {
    slug: "real-cost-of-stacking-amazon-seller-software",
    title: "The Real Cost of Stacking Amazon Seller Software (And Why We Built One Suite Instead)",
    description:
      "What a typical Amazon wholesale software stack actually costs in 2026 — real, current pricing for the tools sellers commonly combine — and what none of them cover that Apex does.",
    category: "Software & Tools",
    publishedAt: "2026-07-27",
    readingTime: "10 min read",
    content: [
      {
        type: "p",
        text: "Almost no wholesale seller starts with one piece of software. They start with a sourcing scanner, add a product research tool, add an inventory tracker, and by month six are paying for four or five separate subscriptions that each do one job well and none of them talk to each other. Here's what that actually costs, using each company's current published pricing.",
      },
      {
        type: "costChart",
        title: "Monthly cost: a typical point-tool stack vs. Apex Starter",
        items: [
          { label: "Seller Assistant App (sourcing scanner)", price: 16, note: "3,500 lookups/mo, paid plan" },
          { label: "Keepa (premium data)", price: 21, note: "Individual premium subscription" },
          { label: "Jungle Scout Starter (product research)", price: 49, note: "Entry-level plan" },
          { label: "InventoryLab / Scoutify (inventory)", price: 69, note: "For sellers moving 100+ units/mo" },
          { label: "Typical 3-tool stack total", price: 106, note: "Scanner + Keepa + inventory, none of which cover POs" },
          { label: "Apex Starter", price: 150, note: "Sourcing, PO management, financial analytics, logistics, prep network, free lifetime Review Booster, 3 free suppliers", highlight: true },
        ],
      },
      {
        type: "p",
        text: "Prices reflect each company's publicly listed plans as of mid-2026; pricing changes, so check current rates directly with each provider. The pattern holds regardless of the exact numbers: a stack of point tools adds up fast, and every one of them stops at research or data — none of them touch purchase orders, supplier relationships, or prep logistics.",
      },
      {
        type: "h2",
        text: "What point tools are genuinely good at",
      },
      {
        type: "p",
        text: "This isn't a knock on any of these tools — Helium 10 and Jungle Scout are strong for keyword research and PPC optimization, Keepa's historical price data is the industry standard, and Seller Assistant App's scanner is fast for on-the-go sourcing checks. If keyword research and PPC management are your priority, those tools still do that job well, and Apex isn't built to replace them.",
      },
      {
        type: "h2",
        text: "What none of them cover",
      },
      {
        type: "table",
        headers: ["What you need", "Typical point-tool stack", "Apex Applications"],
        rows: [
          ["Product/UPC scanning & catalog research", "Seller Assistant App, Keepa, or similar", "Included — Apex Green"],
          ["Purchase order creation & tracking", "Not covered by any research tool", "Included — Apex Blue"],
          ["Financial P&L / margin analytics", "Partial, in some analytics tools", "Included — Apex Blue"],
          ["Supplier/vendor relationship management", "Not covered", "Included — Apex Blue"],
          ["Real authorized distributor contacts", "Not covered", "3 free suppliers on signup"],
          ["Inventory & restock alerts", "InventoryLab/Scoutify (separate cost)", "Included — Apex Red"],
          ["Prep center coordination & network pricing", "Not covered", "Included — Apex Red"],
          ["Automated, compliant review requests", "Separate review tools (extra cost)", "Included free for life — Apex Black"],
          ["Sourcing/ungating/negotiation education", "Not covered", "Included — $300 playbook library, Apex Black"],
          ["Keyword research / PPC / listing optimization", "Helium 10, Jungle Scout", "Not Apex's focus — pair with those if needed"],
        ],
      },
      {
        type: "h2",
        text: "Why we built it this way",
      },
      {
        type: "p",
        text: "Wholesale is an operations business as much as a sourcing business. The parts that actually break a scaling seller — untracked purchase orders, no visibility into landed cost, prep centers you found cold with no vetting, reviews you forgot to request — aren't the parts any research tool was built to solve, because research tools are built for finding products, not running the business around them. Apex Black, Blue, Green, and Red exist specifically to cover that operational backbone in one connected suite, at one price, instead of a stack of point tools that each solve one slice of the problem and leave the rest to a spreadsheet.",
      },
      {
        type: "image",
        src: apexSuiteOverviewImage,
        alt: "Apex dashboard Tools menu showing Apex Black, Blue, and Green modules",
        caption: "One suite, one login, one price — instead of a stack of subscriptions",
      },
      {
        type: "p",
        text: "If you're weighing this decision as part of a broader startup budget, see our [full startup cost breakdown](/blog/how-much-does-it-cost-to-start-amazon-wholesale-2026), or read more about [why we built Apex this way](/blog/why-we-built-apex-applications).",
      },
    ],
  },
  {
    slug: "why-we-built-apex-applications",
    title: "Why We Built Apex Applications: One Suite Instead of Five Subscriptions",
    description:
      "The problem with the current Amazon seller software market, what Apex Applications actually includes, and what we deliberately don't try to be.",
    category: "Company",
    publishedAt: "2026-07-27",
    readingTime: "8 min read",
    content: [
      {
        type: "p",
        text: "Amazon wholesale software today is a market of point solutions: a sourcing scanner here, a keyword tool there, an inventory tracker somewhere else, each with its own login, its own subscription, and its own narrow slice of the problem. We built Apex Applications because that fragmentation is itself a tax on new sellers — one most of them don't notice until they're paying it every month across four different tools that don't talk to each other.",
      },
      {
        type: "h2",
        text: "The problem with the current market",
      },
      {
        type: "p",
        text: "Most Amazon seller software is built around research: finding a product, checking its Keepa history, estimating its sales rank. That's genuinely useful, and tools like Helium 10, Jungle Scout, and Keepa are good at it. But research is only the first hour of running a wholesale business. Nobody builds you the supplier relationship. Nobody tracks whether your purchase order actually landed at the right cost. Nobody coordinates your prep center or reminds a customer to leave a review. Those gaps get filled with spreadsheets, or they don't get filled at all — which is where margin quietly disappears.",
      },
      {
        type: "h2",
        text: "What Apex actually includes",
      },
      {
        type: "image",
        src: apexSuiteOverviewImage,
        alt: "Apex dashboard Tools menu showing Apex Black, Blue, and Green modules",
        caption: "Apex Black, Blue, Green, and Red — one login, one suite",
      },
      {
        type: "ul",
        items: [
          "Apex Black — your dashboard, free lifetime Review Booster, and Apex University's $300 playbook library covering sourcing, negotiation, and ungating SOPs.",
          "Apex Blue — vendor/supplier management, purchase order creation and tracking, financial P&L analytics, and Opex tracking.",
          "Apex Green — Master Catalog for merging supplier price lists, and a UPC Scanner for instant landed-cost and margin checks.",
          "Apex Red — shipments, warehouse and inventory management, and coordination with your prep centers.",
        ],
      },
      {
        type: "p",
        text: "Every new account also starts with [3 free, vetted, authorized US wholesale distributors](/auth?mode=signup&plan=starter&period=monthly) — the single hardest thing for a brand-new seller to get on their own — and a 7-day free trial before any card is charged.",
      },
      {
        type: "h2",
        text: "What we deliberately don't try to be",
      },
      {
        type: "p",
        text: "Apex isn't a keyword research or PPC optimization tool, and we're not trying to out-build Helium 10 or Jungle Scout at that job. If your business depends heavily on listing optimization and ad management, pair Apex with one of those — they're genuinely good at it. What Apex replaces is everything else: the operational backbone of running a wholesale business day to day, which almost no research tool touches at all. We wrote a full breakdown of exactly what that operational gap costs to fill piecemeal in [the real cost of stacking Amazon seller software](/blog/real-cost-of-stacking-amazon-seller-software).",
      },
      {
        type: "h2",
        text: "Real numbers: what a trial actually gets you",
      },
      {
        type: "stats",
        items: [
          { value: "7 days", label: "Free trial before your card is charged" },
          { value: "3", label: "Free authorized suppliers on signup" },
          { value: "$300", label: "Playbook library value, included free" },
          { value: "$0", label: "Cost of Review Booster, free for life" },
        ],
      },
      {
        type: "h2",
        text: "The bet we're making",
      },
      {
        type: "p",
        text: "Our bet is simple: sellers don't actually want more tools. They want fewer logins, one place their numbers live, and a system that gets them from \"I found a good product\" to \"the reorder happened on time and I know my real margin\" without five separate subscriptions in between. That's what we built, and if you're currently stitching that together yourself, [Apex Applications](/pricing) is worth the 7 days it takes to find out if it fits.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}

export function getSortedPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
