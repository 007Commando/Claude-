export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

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
] as const;

export const posts: BlogPost[] = [
  {
    slug: "how-to-start-amazon-wholesale-2026",
    title: "How to Start Amazon Wholesale in 2026: A Step-by-Step Guide",
    description:
      "A practical, no-fluff walkthrough of starting an Amazon wholesale business in 2026 — from picking your first supplier to placing your first purchase order.",
    category: "Getting Started",
    publishedAt: "2026-07-01",
    readingTime: "8 min read",
    content: [
      {
        type: "p",
        text: "Amazon wholesale is still one of the most repeatable ways to build a real e-commerce business, because you're selling products that already have proven demand instead of gambling on something brand new. The tradeoff is that it rewards process more than instinct: sellers who win are the ones who source consistently, track their numbers, and move fast on approvals. Here's the actual sequence, in order.",
      },
      {
        type: "h2",
        text: "1. Register your Amazon Seller Central account correctly",
      },
      {
        type: "p",
        text: "Before you source a single product, set up a Professional Seller Central account (not Individual — you'll need the bulk listing and reporting tools it unlocks). Use a dedicated business email, have your business formation documents and a voided check or bank statement ready, and expect Amazon's identity verification step to take anywhere from a few hours to a couple of weeks. Don't source inventory while this is pending; you want your account fully live before money is on the line.",
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
        type: "h2",
        text: "4. Get ungated before you place a real order",
      },
      {
        type: "p",
        text: "Many of the best wholesale categories — Grocery, Beauty, Health & Personal Care — are gated, meaning Amazon requires an application and an invoice before you can list. Submit your [ungating application](/ungating-guide) using the distributor invoice you collected in step 2 as soon as you know which products you want, not after the inventory arrives. Approval can take anywhere from a few minutes to a few days, and there's no reason to have cash tied up in boxes you can't list yet.",
      },
      {
        type: "h2",
        text: "5. Place your first purchase order — and track it properly",
      },
      {
        type: "p",
        text: "Your first PO should be small: enough to test real sell-through, not so much that a slow mover ties up your capital for months. Track the order, the landed cost per unit (product cost plus shipping plus any prep fees), and the date it hits Amazon's warehouse. This sounds obvious until you're managing your fifth supplier and your twentieth SKU on a spreadsheet that's three tabs deep — which is the exact point where most sellers start losing track of margin. [Apex Blue's](/features/blue) purchase order and Opex tools exist specifically for this stage, so your real profit per unit is visible the moment inventory lands, not two months later when you're reconciling a mess.",
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
        text: "The real difference between sellers who scale and sellers who stall",
      },
      {
        type: "p",
        text: "It's rarely a bad first product. It's almost always a broken process: no system for tracking POs, no repeatable way to find new suppliers, no visibility into real margin until it's too late to fix. [Apex Black](/features/black), [Blue](/features/blue), [Green](/features/green), and [Red](/features/red) exist to cover exactly those four gaps — dashboard and education, financial analytics and purchasing, sourcing and product research, and logistics — as one connected suite instead of five disconnected spreadsheets.",
      },
    ],
  },
  {
    slug: "amazon-ungating-guide-2026",
    title: "How to Get Ungated on Amazon Faster (Without Guessing)",
    description:
      "Why Amazon gates certain categories, what actually gets an ungating application approved, and how to avoid the most common rejection reasons in 2026.",
    category: "Ungating",
    publishedAt: "2026-07-08",
    readingTime: "6 min read",
    content: [
      {
        type: "p",
        text: "Gating exists to keep counterfeit and unauthorized inventory off Amazon, not to keep small sellers out. Once you understand what Amazon's review team is actually checking for, ungating stops being a mystery and becomes a checklist. Here's what actually moves an application from pending to approved.",
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
        text: "The one document that decides most applications: your invoice",
      },
      {
        type: "p",
        text: "Amazon's ungating review is almost entirely invoice-based. A strong invoice has your registered business name, the supplier's business name and contact information, the brand name as it appears on Amazon, matching UPCs for each product, and a purchase quantity that looks like a real wholesale order rather than a single retail purchase. A blurry photo of a handwritten receipt, or an invoice from a retailer like Costco or Sam's Club, will almost always get rejected — Amazon wants an authorized distributor or the brand itself, not a retail purchase.",
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
          "Quantity looks like a retail purchase, not wholesale — most reviewers want to see at least a few units per SKU, not a single unit.",
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
        text: "A rejection isn't final — it's feedback. Read the rejection reason carefully (Amazon usually tells you exactly what was missing), fix that specific gap, and reapply. Don't reapply with the same invoice hoping for a different reviewer; fix the actual issue first. Most second attempts succeed once the real problem — usually a name mismatch or an unauthorized supplier — is corrected.",
      },
    ],
  },
  {
    slug: "reading-keepa-charts-wholesale",
    title: "Reading Keepa Charts for Wholesale: A Practical Framework",
    description:
      "How to read a Keepa chart in under a minute and decide whether a product is actually worth a wholesale purchase order.",
    category: "Product Research",
    publishedAt: "2026-07-13",
    readingTime: "7 min read",
    content: [
      {
        type: "p",
        text: "Keepa is the single most useful free tool in wholesale sourcing, and also the one most new sellers misread. A chart full of colored lines looks intimidating until you know which three lines actually matter for a wholesale buying decision. Here's the framework.",
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
      "A repeatable purchase order workflow for Amazon wholesale sellers — from deciding order quantity to reconciling what actually landed against what you paid for.",
    category: "Operations",
    publishedAt: "2026-07-16",
    readingTime: "7 min read",
    content: [
      {
        type: "p",
        text: "Most wholesale sellers don't lose margin on a bad product — they lose it on a messy purchase order process. Late reorders, mismatched invoices, and prep fees nobody tracked until month-end all quietly eat profit that looked fine on paper. Here's a workflow that closes those gaps.",
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
        text: "4. Reconcile what landed against what you paid for",
      },
      {
        type: "p",
        text: "When inventory arrives at your prep center, check it against the original PO before it ships to Amazon: correct quantity, correct condition, no shortages. Purchase order discrepancies — short shipments, damaged units, wrong items — are common enough in wholesale that catching them here, before the units are checked into FBA, is far easier than disputing them after the fact.",
      },
      {
        type: "h2",
        text: "5. Calculate true landed cost, not just unit cost",
      },
      {
        type: "p",
        text: "Your real cost per unit is the product cost plus inbound shipping, plus prep center fees, plus any FBA prep requirements (poly bagging, labeling) — not just the number on the supplier's invoice. Sellers who only track unit cost consistently overestimate their margin, because none of those add-on costs are small individually, but they compound fast across an order of a few hundred units.",
      },
      {
        type: "h2",
        text: "6. Set a reorder trigger before you run out",
      },
      {
        type: "p",
        text: "For any SKU that's selling consistently, set a reorder point based on your supplier's actual lead time — inventory level at which you place the next PO so a new shipment lands before you go out of stock. Amazon punishes stockouts hard: you lose sales velocity, which can hurt your organic ranking even after you're restocked. Real-time visibility into current inventory across every prep center and warehouse is exactly what [Apex Red's](/features/red) inventory tools are built to give you, so reorder points aren't a guess.",
      },
      {
        type: "h2",
        text: "Why this workflow matters more as you scale",
      },
      {
        type: "p",
        text: "With one supplier and five SKUs, you can run this in your head. With eight suppliers and eighty SKUs, you can't — and the sellers who stall out at that stage are almost always the ones still trying to. A connected system across sourcing, purchasing, and inventory isn't a nice-to-have at that point; it's the difference between scaling and drowning in your own spreadsheets.",
      },
    ],
  },
  {
    slug: "automating-amazon-review-requests",
    title: "Automating Amazon Review Requests the Right Way",
    description:
      "How to build review velocity for new listings using Amazon-compliant automated requests, and the tactics that will get your account suspended.",
    category: "Reviews & Feedback",
    publishedAt: "2026-07-20",
    readingTime: "6 min read",
    content: [
      {
        type: "p",
        text: "Reviews are the single biggest trust signal a new listing has, and also one of the easiest things to get wrong. Amazon has shut down entire seller accounts over review manipulation, so before automating anything, it's worth being precise about what's actually allowed.",
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
    readingTime: "6 min read",
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
        text: "Evaluating prep centers cold takes real time — reference checks, sample shipments, rate comparisons. Apex members get a shortcut: the [Prep Center Network](/prep-center-network) is a vetted list of US prep centers with negotiated member pricing, so the reference-checking work is already done before you ever request a quote.",
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
