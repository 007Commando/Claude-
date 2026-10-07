/**
 * What Apex is, said once.
 *
 * `offer.ts` holds what Apex costs. This file holds what Apex is: the company,
 * the module names, which parts are live, what an AI assistant can and cannot
 * do through the connector, and the handful of figures the site quotes. Pages,
 * llms.txt and structured data read from here, so a module cannot be "Core" on
 * one page and "Black" on the next, and an AI capability cannot be "planned" in
 * a diagram and "live" two sections down (both happened before this existed).
 *
 * Same two labels as offer.ts:
 *
 *   VERIFIED   Read out of the application's code or production data, with the
 *              place it was read from.
 *   PUBLISHED  A decision about how we describe something, not a fact the code
 *              can prove.
 */

import { CATALOG_SIZE_LABEL, MODULE_STATUS, type LaunchState } from "./features";
import { SITE_URL } from "./site";

export const COMPANY = {
  name: "Apex Applications",
  /** What the software is called in a sentence: "connect Apex to Claude". */
  product: "Apex",
  url: SITE_URL,
  appUrl: "https://app.apexapplications.io",
  supportEmail: "support@apexapplications.io",
  /**
   * Profiles that verifiably belong to the company. The Chrome Web Store item
   * is published under "Apex Applications" (item iiffbdhndhjjkepanjchpcbgfbjcepli).
   * Add LinkedIn or YouTube here only once someone confirms the account.
   */
  sameAs: [
    "https://www.trustpilot.com/review/apexapplications.io",
    "https://chromewebstore.google.com/detail/apex-for-amazon-sellers/iiffbdhndhjjkepanjchpcbgfbjcepli",
  ],
} as const;

/** Stable ids so every page's structured data points at the same two things. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;

/* ------------------------------------------------------------------ */
/* Modules                                                             */
/* ------------------------------------------------------------------ */

export type ModuleKey = "green" | "blue" | "gold" | "red" | "black";

export interface ProductModule {
  key: ModuleKey;
  /** The brand name, as the app's own menus spell it. */
  name: string;
  /** What it does, in the words a seller would search for. */
  label: string;
  path: string;
  status: LaunchState;
  /** One plain sentence, no slogan. */
  summary: string;
}

/**
 * PUBLISHED — the five modules, in the order a seller meets them.
 *
 * The dashboard module is Apex Black. The homepage's suite map called it
 * "Apex Core", a label that came in with the site's first commit and never
 * existed in the app (whose routes, menus and plan table all say Apex Black),
 * so it is not a rename to explain, only a stray label to retire.
 */
export const MODULES: ProductModule[] = [
  {
    key: "green",
    name: "Apex Green",
    label: "Product Sourcing & UPC Scanner",
    path: "/features/green",
    status: MODULE_STATUS.green,
    summary: "Upload a supplier price list, match it to Amazon by UPC, and filter the matches by profit, ROI, rank and competition.",
  },
  {
    key: "blue",
    name: "Apex Blue",
    label: "Purchase Orders & Profit Analytics",
    path: "/features/blue",
    status: MODULE_STATUS.blue,
    summary: "Suppliers, purchase orders, landed cost, profit and loss, operating expenses and restock planning in one place.",
  },
  {
    key: "gold",
    name: "Apex Gold",
    label: "Amazon Repricer",
    path: "/features/gold",
    status: MODULE_STATUS.gold,
    summary: "Rule-based repricing with floors worked out from your own cost and Amazon's fees, previewed before a price moves.",
  },
  {
    key: "red",
    name: "Apex Red",
    label: "Prep & Shipment Management",
    path: "/features/red",
    status: MODULE_STATUS.red,
    summary: "Shipments, warehouses, prep center chat and prep billing. In beta, opened by invitation.",
  },
  {
    key: "black",
    name: "Apex Black",
    label: "Dashboard, Reviews & Training",
    path: "/features/black",
    status: MODULE_STATUS.black,
    summary: "The home dashboard, Review Booster for Amazon's Request a Review, and Apex University.",
  },
];

export const moduleByKey = (key: ModuleKey): ProductModule =>
  MODULES.find((m) => m.key === key) ?? MODULES[0];

/* ------------------------------------------------------------------ */
/* AI assistants (the MCP connector)                                   */
/* ------------------------------------------------------------------ */

export type FeatureStatus = "live" | "beta" | "planned";

export interface AiTool {
  name: string;
  /** What a seller gets from it, not what it queries. */
  does: string;
}

/**
 * VERIFIED — the connector, read from the backend on 2026-10-07:
 * `src/mcp/tools.ts`, `researchTools.ts`, `writeTools.ts`, `metering.ts`,
 * `audit.ts` and `docs/mcp-connector.md`, at the revision deployed as `api`
 * (2731b39). Usage in production that day: Claude keys in use, and a ChatGPT
 * client recorded on a key's `clients` map, so both connect. No write link had
 * been used by a seller yet.
 *
 * Plan rules as enforced, not as planned: read tools follow each page's own
 * gate (a paid plan, the seven-day trial included). A write link needs Pro,
 * checked when it is made and again on every call. `MCP_REQUIRE_PRO` and
 * `MCP_ENFORCE_CREDITS` are off, so there is no Pro-only reading and no credit
 * allowance to publish. Do not publish a credit price until the 30 days of
 * metering have been read (Stefano, 2026-10-03).
 */
export const AI_CONNECTOR = {
  endpoint: `${COMPANY.appUrl}/api/mcp`,
  transport: "Streamable HTTP (stateless JSON-RPC over POST)",
  auth: "A per-seller connector key, sent as a Bearer token or, for clients that only take a URL, in the path",
  readPlan: "Any paid Apex plan, including the 7-day trial",
  writePlan: "Pro",
  /** The date the facts in this block were last checked against the code. */
  lastVerified: "2026-10-07",
  limits: {
    callsPerMinutePerKey: 60,
    callsInFlightPerAccount: 4,
    writeCallsPerMinutePerKey: 10,
    draftsPerDayPerAccount: 100,
    liveKeysPerAccount: 10,
    writeKeysPerAccount: 3,
    poLinesMax: 50,
    productsPerCallMax: 100,
  },
  readTools: [
    { name: "get_business_snapshot", does: "A count of your products, how many are profitable, suppliers and plan." },
    { name: "get_growth_gaps", does: "Structural gaps holding growth back, such as too few suppliers." },
    { name: "get_profitable_opportunities", does: "Profitable products in your database you are not selling yet." },
    { name: "search_products", does: "Your product database with cost, price, profit, ROI, stock and rank." },
    { name: "list_catalog_scans", does: "Supplier catalog scans you have run, optionally for one supplier." },
    { name: "get_catalog_scan_results", does: "The matches from one scan, sortable by profit or ROI, with an option to show only products you do not have yet." },
    { name: "search_brands", does: "Brands to source from, with product counts, prices, seller counts and how much Amazon sells itself. Naming a brand uses your plan's monthly brand searches." },
    { name: "research_products", does: "Amazon products filtered by brand, rank, sellers and price, leaving out the ones already in your database." },
    { name: "get_profit_and_loss", does: "Monthly sales, fees, cost of goods and gross profit." },
    { name: "get_profit_and_loss_statement", does: "A profit and loss statement over a date range, by day, week or month." },
    { name: "get_inventory", does: "FBA inventory, sales velocity, days of stock left and restock status." },
    { name: "get_restock_recommendations", does: "Profitable products you sell that are lowest on stock." },
    { name: "get_purchase_orders", does: "Your purchase orders with supplier, status, lines, landed cost, projected profit and ROI." },
    { name: "get_repricer_listings", does: "Your listings as the repricer sees them." },
    { name: "get_repricer_impact", does: "What repricing has changed and what it was worth." },
    { name: "get_map_compliance", does: "Minimum advertised price status by brand." },
  ] as AiTool[],
  writeTools: [
    { name: "create_draft_purchase_order", does: "A draft purchase order on your Open tab. It is never submitted and nothing is sent to a supplier." },
    { name: "add_products_to_database", does: "Products added to your database as drafts, never activated. Products you already hold under that supplier are skipped." },
    { name: "add_vendor", does: "A new supplier on your Vendors page. A name you already have is refused." },
  ] as AiTool[],
  /** Things an assistant can never do through Apex, by construction. */
  never: [
    "submit or send a purchase order",
    "contact a supplier",
    "spend money",
    "create or send a shipment",
    "change a live price or repricer setting",
    "delete anything",
  ],
  /** PUBLISHED — planned, with no dates, and never shown as live. */
  planned: [
    "Choosing which areas a key can read, such as profit and loss only",
    "Signing in with OAuth instead of pasting a link",
    "Proposing repricer changes that apply only after you approve them in Apex",
  ],
} as const;

/**
 * VERIFIED against each assistant's own help pages on 2026-10-07. Menu names
 * move; re-check these against the cited pages before changing the guides.
 *
 * `interfaceTested` is whether a person has clicked through the guide's steps
 * in the real assistant with a real Apex link. Until then the guide is public
 * but kept out of search (noindex, not in the sitemap): its steps come from the
 * assistant's own documentation and production shows both clients connecting,
 * but nobody has walked those exact screens. Flip it after that walk-through.
 */
export const AI_CLIENTS = {
  claude: {
    name: "Claude",
    surfaces: "Claude on the web, the Claude desktop app and Claude Code",
    plans:
      "Custom connectors are available on Claude's Free, Pro, Max, Team and Enterprise plans. Free accounts can add one custom connector. On Team and Enterprise, an owner adds it for the organization.",
    menuPath: "Customize, then Connectors, then Add, then Add custom connector",
    docs: "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp",
    lastTested: "2026-10-07",
    interfaceTested: false,
  },
  chatgpt: {
    name: "ChatGPT",
    surfaces: "ChatGPT on the web",
    plans:
      "Adding a custom MCP server needs a paid ChatGPT plan that allows it. In a Business or Enterprise workspace, your admin's settings decide whether you can add one.",
    menuPath: "Plugins, then the plus button, then Add custom MCP server",
    docs: "https://developers.openai.com/api/docs/guides/custom-mcp-server",
    lastTested: "2026-10-07",
    interfaceTested: false,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Figures the site quotes                                             */
/* ------------------------------------------------------------------ */

export interface VerifiedStat {
  value: string;
  what: string;
  /** Where and when it was counted. Shown in source, never as a caption. */
  source: string;
}

/**
 * VERIFIED — production counts on 2026-10-07, rounded down so a growing table
 * can never turn them false. "Products tracked" was 290k+ on /ai, which
 * counted deleted rows; active ones are 130,888.
 */
export const VERIFIED_STATS: Record<"catalog" | "identifiers" | "orders" | "productsTracked", VerifiedStat> = {
  catalog: { value: CATALOG_SIZE_LABEL.replace(" products", ""), what: "Amazon products in the Apex catalog", source: "shared_amazon_product_data, 122.3M rows" },
  identifiers: { value: "98M+", what: "UPC and EAN identifiers for matching supplier lists", source: "shared_amazon_product_identifiers, 98,958,687 rows" },
  orders: { value: "1.8M+", what: "seller orders synced from Amazon", source: "amazon_sale_orders, 1,805,849 rows" },
  productsTracked: { value: "130k+", what: "products sellers track in their databases", source: "blue_housed_asins where deleted_at is null, 130,888 rows" },
};

/* ------------------------------------------------------------------ */
/* Review Booster                                                      */
/* ------------------------------------------------------------------ */

/**
 * VERIFIED — `utils/pubsubs/requestReviews.ts` sends Amazon's own Request a
 * Review (Solicitations API, productReviewAndSellerFeedback) for shipped
 * Amazon.com orders once the seller's waiting period has passed. The seller
 * can leave out whole listings by SKU; it never looks at a buyer or what they
 * might say, writes nothing, and Amazon's own message is the only thing sent.
 * Amazon decides which orders are eligible.
 *
 * Free to switch on without a card until the end of October 31, 2026, New York
 * time (REVIEW_BOOSTER_FREE_UNTIL, Stefano 2026-10-07). After that it needs a
 * plan or the trial. Boosters switched on during the offer keep running.
 */
export const REVIEW_BOOSTER = {
  mechanism: "Amazon's own Request a Review button, sent for you",
  marketplace: "Amazon.com",
  freeUntil: "2026-10-31",
  freeUntilLabel: "October 31, 2026",
} as const;

/** True while the free Review Booster offer is running. */
export const reviewBoosterFreeNow = (now: Date = new Date()): boolean =>
  now.getTime() < Date.parse("2026-11-01T04:00:00Z");

/* ------------------------------------------------------------------ */
/* Entitlements stated on many pages                                   */
/* ------------------------------------------------------------------ */

/**
 * VERIFIED — `utils/black/distributorRewards.ts` and the rewards controller,
 * 2026-10-07. The schedule counts from the subscription's start, trial
 * included: monthly opens 3 then 3 a month, quarterly 90 then 90 a quarter,
 * annual the whole Vault at once. The site had three different versions of
 * this ("Annual Members Only", "3 and 3", "shown in your account"); this is
 * the one sentence they all now use.
 */
export const SUPPLIER_ACCESS =
  "Every subscription, trial included, opens 3 US wholesale distributors from the Distributor Vault when it starts and 3 more each month. Quarterly billing opens 90 a quarter, and an annual plan opens the whole Vault at once.";

/**
 * VERIFIED — the Chrome Web Store listing is public, and backend 7ed26cd gates
 * its product data behind finishing Apex University (`universityGraduateRequired`).
 * Three pages gave three answers ("none", "free for graduates", a store link).
 */
export const CHROME_EXTENSION = {
  name: "Apex for Amazon Sellers",
  url: "https://chromewebstore.google.com/detail/apex-for-amazon-sellers/iiffbdhndhjjkepanjchpcbgfbjcepli",
  summary:
    "Apex for Amazon Sellers is free to install from the Chrome Web Store. Its product data opens once you finish Apex University, which comes with every Apex account.",
} as const;

/**
 * VERIFIED — `repricedListings` in services/plans/entitlements.ts, and
 * GOLD_REPRICER_LIVE in the deployed env, 2026-10-07. There is no scheduled
 * repricing run: prices move when the seller runs their strategies from Apex
 * (the Run button, POST /gold/repricer/dry-run, which applies live while the
 * flag is on). Reacting to a competitor's offer change is built
 * (`offerChanges`, every minute) but inert until the SP-API SQS queue exists.
 */
export const REPRICER_FACTS = {
  plans: "Included in Pro on every listing. Plus can use it on 5 listings and Beginner on 1. Starter does not include it.",
  howPricesMove:
    "Prices change when you run your strategies from Apex. Repricing automatically the moment a competitor changes price is built but not switched on yet.",
} as const;

/* ------------------------------------------------------------------ */
/* Per-module facts for the feature pages                              */
/* ------------------------------------------------------------------ */

export interface ModuleFacts {
  problem: string;
  forWho: string;
  needs: string[];
  steps: string[];
  gets: string;
  /** What syncs from Amazon versus what the seller types in. Blue and Black only. */
  syncedVsEntered?: { synced: string; entered: string };
  plans: string[];
  limits: string[];
  ai: { ask: string; note: string } | null;
  related: { label: string; href: string }[];
}

/**
 * PUBLISHED, from VERIFIED facts — what each feature page's "At a glance"
 * block says. Plan figures come from PLAN_LIMITS in offer.ts, so they are
 * written here as sentences built from those numbers where they appear.
 */
export const MODULE_FACTS: Record<ModuleKey, ModuleFacts> = {
  green: {
    problem:
      "A supplier sends a price list with thousands of lines. Checking each one against Amazon by hand takes days, and most lines are not worth buying.",
    forWho: "Wholesale sellers working through supplier price lists, from a first distributor to dozens.",
    needs: [
      "A supplier price list in CSV or Excel with UPC or EAN codes and your cost per unit",
      "The supplier's name, so the matches are filed under it",
    ],
    steps: [
      "Upload the price list and pick the supplier",
      "Map the UPC and cost columns",
      "Apex matches each code to Amazon products in the background",
      "Filter by profit, ROI, sales rank, seller count and whether Amazon sells it, and hide products you already carry",
      "Add the products you want to your database, or put them straight on a purchase order",
    ],
    gets:
      "Each matched product with landed cost, Amazon price, Amazon fees, profit at the Buy Box, ROI and margin, sales rank, seller count, whether Amazon is on the listing, and hazmat and meltable flags.",
    plans: [
      "Beginner: 2 scans and 20,000 lines a month",
      "Starter: 5 scans and 60,000 lines a month",
      "Plus: unlimited scans, 300,000 lines a month",
      "Pro: unlimited",
      "30, 60 and 90 day average prices and ranks are on Plus and Pro",
    ],
    limits: [
      "Coverage is not the same as freshness. Apex matches against 122M+ Amazon products, but prices, ranks and offers refresh for the products sellers track, so an untracked product can show older figures until it is refreshed.",
      "Profit uses the cost in your file plus the shipping you set. Check bundles and case packs before you order.",
    ],
    ai: {
      ask: "Which products from my last scan for this supplier clear 30% ROI and are not in my database yet?",
      note: "Your assistant reads scans you have already run. It cannot upload a price list.",
    },
    related: [
      { label: "Free FBA calculator", href: "/tools/fba-calculator" },
      { label: "Finding wholesale suppliers", href: "/amazon-wholesale-suppliers" },
      { label: "Apex vs SellerAmp", href: "/compare/selleramp" },
      { label: "Ask your assistant about a scan", href: "/ai" },
    ],
  },
  blue: {
    problem:
      "Costs live in one spreadsheet, orders in email and profit in Seller Central reports, so nobody knows the real margin on a product or when to reorder it.",
    forWho: "Sellers buying from several suppliers who want purchase orders, landed cost, profit and restocking in one place.",
    needs: [
      "Your Amazon account connected, so sales, fees and inventory sync",
      "Your suppliers and product costs, entered or uploaded once",
      "Inbound shipping, prep and operating expenses, if you want them in profit",
    ],
    steps: [
      "Add suppliers and products with their costs and case packs",
      "Build a purchase order from your database or a supplier scan",
      "Submit it; its unit costs become the cost of goods for those products",
      "Read profit and loss by day, week or month",
      "Use the inventory view to see days of stock left and what needs restocking",
    ],
    gets:
      "Purchase orders with landed cost, projected revenue, profit and ROI; a profit and loss statement with gross profit and, after the operating expenses you enter, net profit; and inventory with days of stock and a restock status for each product.",
    syncedVsEntered: {
      synced: "Orders, sales, refunds, Amazon fees and FBA inventory, every few minutes.",
      entered: "Product costs, inbound shipping and prep, operating expenses and supplier lead times. A submitted purchase order fills in unit costs for you; a cost you type yourself always wins.",
    },
    plans: [
      "Beginner: 500 products in your database, 1 user",
      "Starter: 1,000 products, 1 user",
      "Plus: 2,000 products, 3 users",
      "Pro: 4,000 products, 5 users",
      "Purchase order discrepancy tracking, exports and 30, 60 and 90 day Buy Box averages are on Plus and Pro",
    ],
    limits: [
      "Profit is only as complete as the costs you enter. A product with no cost shows sales but no true profit.",
      "Operating expenses are counted for the whole store, not split across products.",
      "Restock suggestions come from your stock, sales velocity and the cover you set. They are not a demand forecast.",
    ],
    ai: {
      ask: "How did my business do this month after expenses, and which profitable products should I reorder?",
      note: "On Pro, a write link lets your assistant prepare a draft purchase order for you to review.",
    },
    related: [
      { label: "Inventory and restock planning", href: "/amazon-inventory-management-software" },
      { label: "Profit and ROI calculator", href: "/tools/amazon-profit-calculator" },
      { label: "Apex vs Sellerboard", href: "/compare/sellerboard" },
      { label: "Apex vs InventoryLab", href: "/compare/inventorylab" },
    ],
  },
  gold: {
    problem:
      "Matching the lowest price by hand, or with a repricer that does not know your costs, can sell stock below what it cost you.",
    forWho: "Pro sellers with FBA listings that share the Buy Box with other sellers.",
    needs: [
      "Your Amazon account connected",
      "Product costs in your Apex database, so the floor is real",
      "A target for each listing or group: a minimum ROI, margin or dollar profit",
    ],
    steps: [
      "Set floors from your cost and Amazon's fees, or from a target ROI, margin or profit, in bulk",
      "Build a strategy for how to respond to competing offers and assign it to listings",
      "Preview what it would change before any price moves",
      "Turn listings on and run your strategies; every price decision is logged in Price Activity",
    ],
    gets: "Price changes that stay between your floor and ceiling, with a log of each decision and the reason for it, and MAP status by brand.",
    plans: [
      "Pro: every listing",
      "Plus: up to 5 listings",
      "Beginner: 1 listing",
      "Starter: not included",
    ],
    limits: [
      "In beta.",
      "Prices change when you run your strategies from Apex. Repricing automatically the moment a competitor changes price is built but not switched on yet.",
      "Rule-based, not AI. Nobody can promise the Buy Box or a profit; the floor only stops it pricing below your own numbers.",
    ],
    ai: {
      ask: "What has the repricer changed this month, and what was it worth?",
      note: "Assistants can read repricer results. They cannot change a price or a strategy.",
    },
    related: [
      { label: "Apex vs Seller Snap", href: "/compare/sellersnap" },
      { label: "Apex vs BQool", href: "/compare/bqool" },
      { label: "Apex vs Informed", href: "/compare/informed-repricer" },
      { label: "Plans and pricing", href: "/pricing" },
    ],
  },
  red: {
    problem:
      "Shipments, prep center messages and prep bills sit in email threads and spreadsheets, separate from the orders they belong to.",
    forWho: "Sellers who use a prep center or their own warehouse, and the prep centers that serve them.",
    needs: [
      "An invitation to the beta, or a connection to a prep center that is approved on Apex",
      "Your warehouse or prep center added in Apex",
    ],
    steps: [
      "Add your warehouse or connect your prep center",
      "Track the inventory held there",
      "Build shipments to Amazon",
      "Message your prep center and see its bills in the same place",
    ],
    gets: "Shipments, warehouse inventory, prep chat and prep bills alongside the rest of your Apex data.",
    plans: [
      "Beta, opened by invitation on any plan",
      "Free for sellers connected to a prep center that is approved on Apex",
    ],
    limits: ["In beta: screens and steps may change, and some shipment steps are still being finished."],
    ai: null,
    related: [
      { label: "Choosing an FBA prep center", href: "/amazon-fba-prep-centers" },
      { label: "Apex for prep centers", href: "/for-prep-centers" },
      { label: "Prep Center Network", href: "/prep-center-network" },
    ],
  },
  black: {
    problem:
      "There is no single view of how the business is doing, and buyers only leave reviews if someone remembers to ask.",
    forWho: "Every Apex account. It is the home screen.",
    needs: ["Your Amazon account connected, for the dashboard and Review Booster"],
    steps: [
      "Open the dashboard for sales, profit and inventory at a glance",
      "Switch on Review Booster, choose how many days to wait after an order, and leave out any listings you want",
      "Work through Apex University, one lesson at a time",
    ],
    gets:
      "A dashboard of your Amazon business; Amazon's own Request a Review sent on eligible Amazon.com orders after the wait you choose, with a log of every request; and Apex University's lessons.",
    syncedVsEntered: {
      synced: "Orders and sales from Amazon feed the dashboard and decide which orders Review Booster can ask about.",
      entered: "The wait in days and any listings to leave out of review requests.",
    },
    plans: [
      "Review Booster: 20 requests a month on Beginner, unlimited on Starter, Plus and Pro",
      "Review Booster is free to switch on until October 31, 2026, with no card",
      "Apex University comes with every account",
    ],
    limits: [
      "Review Booster sends Amazon's standard message. It cannot write reviews, choose which buyers are asked, ask only happy buyers, or guarantee a review.",
      "Amazon.com orders only, and Amazon decides which orders are eligible.",
    ],
    ai: {
      ask: "How is my business doing overall?",
      note: "Your assistant reads the same snapshot the dashboard shows.",
    },
    related: [
      { label: "How review request automation works", href: "/amazon-review-automation" },
      { label: "Review Booster", href: "/review-booster" },
      { label: "Free wholesale course", href: "/free-course" },
      { label: "Apex for Chrome", href: "/tools#chrome-extension" },
    ],
  },
};
