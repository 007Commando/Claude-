"use client";

/**
 * How Apex Works — product documentation.
 *
 * Written from the application itself rather than the marketing pages. Every
 * screen named here is a real route in apex-apps/frontend, every column
 * described is one the screen actually renders, and the repricer settings are
 * the fields on the strategy schema. If the product changes, this page is
 * wrong until someone updates it — that is the trade for being specific enough
 * to be worth reading.
 *
 * Who this is for shapes every decision in it. The reader is usually stuck
 * mid-task and arriving from a support link, not browsing. So:
 *
 *   - Search comes first. Someone who already knows they want "cost of goods"
 *     should not have to guess which colour module owns it. The index covers
 *     every screen and every topic, matches on name, description and route,
 *     and is keyboard-driven.
 *   - "Where do I find…" sits above the explanations, because a frustrated
 *     person wants the location before the philosophy.
 *   - Troubleshooting is a real section, covering the failures that actually
 *     generate support messages: missing orders, wrong profit, absent costs.
 *   - Every heading carries a permanent anchor so support can link to the
 *     exact answer.
 *
 * Two honesty rules held while building it. Screenshots are real Apex screens
 * or they are not screenshots — Red and Gold have no captured screens in this
 * repo, so those sections use diagrams built from the real stage names and
 * strategy identities, each labelled as a diagram. And nothing here promises
 * an outcome: suppliers decide who they open accounts for, Amazon decides
 * selling approvals and the Buy Box, and the projections in Blue are
 * arithmetic on figures the seller enters.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Atom,
  BarChart3,
  Boxes,
  Building2,
  CreditCard,
  ExternalLink,
  Files,
  GraduationCap,
  Info,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Package,
  PackageCheck,
  Receipt,
  ScanBarcode,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Tag,
  Truck,
  Users,
  Warehouse,
  X,
  Zap,
} from "lucide-react";

import "./apex-docs.css";

const ORIGIN = "https://www.apexapplications.io";
const APP_URL = "https://app.apexapplications.io";

/** Real Apex screens, from the asset paths the product pages already use. */
const SHOT = {
  dashboard: "/__l5e/assets-v1/11cb8d00-3aa3-45bd-ba16-dcecd12a8720/dashboard.png",
  reviewBooster: "/__l5e/assets-v1/de928299-6360-41ce-8fc7-6b11b65ee8fa/review-booster.png",
  university: "/__l5e/assets-v1/69542212-caf8-444b-9f6d-3582caa5c0ec/apex-university.png",
  vendors: "/__l5e/assets-v1/2f47b264-ff96-47e8-89d6-7239b34366b7/vendors-dashboard.png",
  purchaseOrders: "/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png",
  opex: "/__l5e/assets-v1/07523237-4af0-4426-a224-9038a35ee689/opex-dashboard.png",
  inventory: "/__l5e/assets-v1/ee02f991-391f-4c5f-9486-9cbc99e46bd7/inventory-restocking.png",
  masterCatalog: "/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png",
  upcScanner: "/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png",
} as const;

type ModuleKey = "black" | "blue" | "green" | "red" | "gold" | "general";

/** One place for each module's colour, so a section and its search chip agree. */
const MODULE: Record<ModuleKey, { label: string; accent: string; soft: string }> = {
  black: { label: "Apex Black", accent: "#0f172a", soft: "#f1f5f9" },
  blue: { label: "Apex Blue", accent: "#2563eb", soft: "#eef3ff" },
  green: { label: "Apex Green", accent: "#16a34a", soft: "#ecfdf3" },
  red: { label: "Apex Red", accent: "#dc2626", soft: "#fef3f2" },
  gold: { label: "Apex Gold", accent: "#d97706", soft: "#fffaeb" },
  general: { label: "General", accent: "#5c6470", soft: "#f2f4f7" },
};

const accentVars = (m: ModuleKey) =>
  ({ "--accent": MODULE[m].accent, "--accent-soft": MODULE[m].soft }) as CSSProperties;

type Screen = {
  Icon: typeof Boxes;
  name: string;
  body: string;
  /** One button per route. A screen that spans two paths gets two. */
  routes: string[];
  module: ModuleKey;
  section: string;
};

const BLACK_SCREENS: Screen[] = [
  {
    Icon: LayoutDashboard,
    name: "Dashboard",
    body: "The whole business on one screen: Amazon balance, total sales, total profits, gross profit per ASIN, ROI, margin and units sold, each against the previous period, over a date range you choose.",
    routes: ["/dashboard"],
    module: "black",
    section: "black",
  },
  {
    Icon: Star,
    name: "Review Booster",
    body: "Automates the review and seller-feedback requests Amazon allows on your orders, so asking is not a job someone has to remember to do.",
    routes: ["/review-booster"],
    module: "black",
    section: "black",
  },
  {
    Icon: GraduationCap,
    name: "Apex University",
    body: "The wholesale course, inside the software it teaches. Four modules across nine videos: what the business is, suppliers, product research and purchasing.",
    routes: ["/university"],
    module: "black",
    section: "black",
  },
  {
    Icon: Files,
    name: "Books & Resources",
    body: "The resource library: the reading and the vendor references we actually use, rather than a directory of everyone who would take your call.",
    routes: ["/books"],
    module: "black",
    section: "black",
  },
];

const BLUE_SCREENS: Screen[] = [
  {
    Icon: Building2,
    name: "Vendors",
    body: "Every supplier in one table: website, account number, login, contact name, email and phone, stated lead time against actual lead time, account requirements, payment method and the catalog attached to them. Plus spend by vendor and your top products once orders start landing.",
    routes: ["/vendors"],
    module: "blue",
    section: "blue",
  },
  {
    Icon: Layers,
    name: "Databases",
    body: "Market intelligence for your listings: the reference data you check a product against before you commit to buying it.",
    routes: ["/databases"],
    module: "blue",
    section: "blue",
  },
  {
    Icon: Receipt,
    name: "Purchase Orders",
    body: "Where an order gets built and projected. Units purchased, cost of goods, Amazon fees, estimated shipping and prepping, then total revenue, expenses, profit, margin and ROI for the order as configured, before you send it.",
    routes: ["/purchase-orders"],
    module: "blue",
    section: "blue",
  },
  {
    Icon: BarChart3,
    name: "Analytics",
    body: "Two views. Profit & Loss for what the business earned, and Inventory for what you are holding: stock value, available units, sales velocity, days of inventory, days until next order and a stock status on every ASIN.",
    routes: ["/analytics"],
    module: "blue",
    section: "blue",
  },
  {
    Icon: CreditCard,
    name: "Operating Expenses",
    body: "The costs that are not cost of goods: software, prep, freight, salaries. Recorded so the profit figures elsewhere are the real ones rather than gross margin wearing a disguise.",
    routes: ["/opex"],
    module: "blue",
    section: "blue",
  },
  {
    Icon: Receipt,
    name: "Update COGS",
    body: "Where cost of goods is entered or corrected for products already selling. Amazon knows what you sold something for; it does not know what you paid, and this is the screen that closes that gap.",
    routes: ["/update-cogs"],
    module: "blue",
    section: "blue",
  },
];

const GREEN_SCREENS: Screen[] = [
  {
    Icon: ScanBarcode,
    name: "UPC Scanner",
    body: "Load a supplier price list and read it line by line: landed cost against current, 30, 60 and 90-day sold price, FBA fees, referral fees, shipping and inbound placement, then profit, ROI and margin on every row.",
    routes: ["/upc-scanner"],
    module: "green",
    section: "green",
  },
  {
    Icon: Boxes,
    name: "Master Catalog",
    body: "Merge and manage the catalogs your vendors send you, so one supplier's spreadsheet format stops being a project every time it arrives.",
    routes: ["/master-catalog"],
    module: "green",
    section: "green",
  },
  {
    Icon: Tag,
    name: "Brands & Products",
    body: "The brands and products you have scanned or bought, kept so the research you did last quarter is still there when the same catalog lands again.",
    routes: ["/brands", "/products"],
    module: "green",
    section: "green",
  },
];

const RED_SCREENS: Screen[] = [
  {
    Icon: Truck,
    name: "Shipments",
    body: "Stock moves through four stages: Draft while you are deciding what goes, Inbound once it is on its way to your prep centre or warehouse, Working while it is being received and prepped, then the Amazon shipment itself.",
    routes: ["/shipments"],
    module: "red",
    section: "red",
  },
  {
    Icon: Warehouse,
    name: "Warehouses",
    body: "Your own locations, with sellable units per warehouse and printer settings for the labels produced there.",
    routes: ["/warehouses"],
    module: "red",
    section: "red",
  },
  {
    Icon: Package,
    name: "Inventory",
    body: "What is physically held, as opposed to what Amazon says is available to sell.",
    routes: ["/inventory"],
    module: "red",
    section: "red",
  },
  {
    Icon: MessageSquare,
    name: "Prep chat & billing",
    body: "If you use a prep centre on Apex, the conversation and the invoices live next to the shipment they concern. Prep centres get the other side: their merchants, chat, billing and payment structures.",
    routes: ["/prep-chat", "/prep-billing"],
    module: "red",
    section: "red",
  },
];

const GOLD_SCREENS: Screen[] = [
  {
    Icon: SlidersHorizontal,
    name: "Strategy",
    body: "Pick how a SKU should be priced. Three built-in strategies, or a custom one you build yourself and reuse across listings.",
    routes: ["/strategy"],
    module: "gold",
    section: "gold",
  },
  {
    Icon: Tag,
    name: "Listings",
    body: "Every SKU with its listing price, the Buy Box price, whether you currently own the Buy Box, the cheapest live offer, stock and the strategy assigned to it.",
    routes: ["/listings"],
    module: "gold",
    section: "gold",
  },
  {
    Icon: BarChart3,
    name: "Price Activity",
    body: "What the repricer actually did, and why. A price that moved without a record of the reason is a price nobody can learn from.",
    routes: ["/price-activity"],
    module: "gold",
    section: "gold",
  },
];

const SETTINGS_SCREENS: Screen[] = [
  {
    Icon: Users,
    name: "Personal & account info",
    body: "Your name, business details, profile picture and contact information.",
    routes: ["/settings"],
    module: "general",
    section: "team",
  },
  {
    Icon: ShieldCheck,
    name: "Two-factor authentication & sessions",
    body: "Turn on 2FA, and see every device currently signed in to the account. Worth doing on an account that can see your supplier logins.",
    routes: ["/settings"],
    module: "general",
    section: "team",
  },
  {
    Icon: Users,
    name: "Authorised users & permissions",
    body: "Add a team member, then grant access screen by screen rather than sharing one login.",
    routes: ["/authorised-users"],
    module: "general",
    section: "team",
  },
  {
    Icon: Boxes,
    name: "Subscriptions",
    body: "Which modules are on your account, and what changing them does.",
    routes: ["/subscriptions"],
    module: "general",
    section: "team",
  },
];

const ALL_SCREENS = [
  ...BLACK_SCREENS,
  ...BLUE_SCREENS,
  ...GREEN_SCREENS,
  ...RED_SCREENS,
  ...GOLD_SCREENS,
  ...SETTINGS_SCREENS,
];

/** Task-first index: what someone is trying to do, and where it happens. */
const QUICK: readonly (readonly [string, string, string, string])[] = [
  ["Enter or fix what a product cost me", "Update COGS", "/update-cogs", "blue"],
  ["Check a supplier catalog for products worth buying", "UPC Scanner", "/upc-scanner", "green"],
  ["Build an order and see its profit before I send it", "Purchase Orders", "/purchase-orders", "blue"],
  ["Find a supplier's account number or login", "Vendors", "/vendors", "blue"],
  ["See what I actually earned last month", "Analytics · Profit & Loss", "/analytics", "blue"],
  ["Work out what to reorder, and when", "Analytics · Inventory", "/analytics", "blue"],
  ["Record software, prep or freight costs", "Operating Expenses", "/opex", "blue"],
  ["Send stock to a prep centre or warehouse", "Shipments", "/shipments", "red"],
  ["Change how a SKU is priced", "Strategy", "/strategy", "gold"],
  ["See why the repricer moved a price", "Price Activity", "/price-activity", "gold"],
  ["Give a VA access without sharing my login", "Authorised Users", "/authorised-users", "general"],
  ["Connect or reconnect my Amazon account", "Settings", "/settings", "general"],
];

const STRATEGIES = [
  { Icon: ShieldCheck, name: "Saver", tagline: "Protects your margin", fg: "#1570EF", bg: "#EFF8FF" },
  { Icon: Zap, name: "Slayer", tagline: "Undercuts to win the Buy Box", fg: "#D92D20", bg: "#FEF3F2" },
  { Icon: Atom, name: "Cellular", tagline: "Reads sellers and stock", fg: "#027A48", bg: "#ECFDF3" },
  { Icon: SlidersHorizontal, name: "Custom", tagline: "Your own rules, saved and reused", fg: "#d97706", bg: "#FFFAEB" },
] as const;

/** The custom strategy schema, in the order the builder presents it. */
const STRATEGY_SETTINGS: readonly (readonly [string, string])[] = [
  ["Competitors", "Which offers count: Amazon itself, other FBA sellers, FBM sellers. Whether to include non-featured offers, whether to try to beat Amazon, whether Seller Fulfilled Prime counts as FBA, and any sellers to ignore entirely."],
  ["Seller quality", "Ignore offers from sellers below a feedback percentage or a rating count, and decide whether unrated sellers are included or excluded."],
  ["Price basis", "Compare on the item price alone, or on the landed price with shipping included."],
  ["Targeting", "What to aim at in four situations: when you do not own the Buy Box, when you do, when the listing is suppressed, and when the Buy Box is filtered out. Each can target the Buy Box, the lowest eligible offer, the next best offer, climb toward your maximum, or hold."],
  ["Offset", "Once you have a target: match it, beat it, or sit above it, by a fixed amount or a percentage."],
  ["Offset overrides", "A different offset per matchup, so your FBA against Amazon behaves differently from your FBA against another FBA seller."],
  ["Fallback", "What to do when there is no competition at all, and what to do when you are out of stock."],
  ["Safety", "The guard rails: the biggest single drop and rise allowed, a cooldown between moves, how stale market data may be before the engine stops acting on it, whether your floor and ceiling come from your costs or are set by hand, and the margin you are targeting."],
  ["Rounding", "Leave prices as calculated, or end them in .99 or .95."],
];

const PERMISSIONS = [
  "Dashboard", "Analytics", "Vendors", "Databases", "Purchase Orders",
  "Inventory", "Shipments", "Warehouses", "Prep Billing", "Prep Chat", "Review Booster",
];

const TROUBLE: readonly (readonly [string, string])[] = [
  [
    "My sales are showing but my profit looks wrong or is zero",
    "Almost always missing cost of goods. Amazon reports what a unit sold for, never what you paid for it, so until a cost exists Apex can only show revenue. Add costs in Update COGS, or let them arrive automatically with a purchase order. If profit looks too high rather than too low, check Operating Expenses next: software, prep, freight and salaries are not part of cost of goods and have to be recorded separately.",
  ],
  [
    "I connected Amazon but I cannot see my orders yet",
    "The first sync is not instant. Orders, listings, fees and settlement data come across in batches and figures fill in as they land rather than all at once. If a day passes with nothing, open Settings and check the Amazon connection is still authorised — an expired authorisation looks exactly like an empty account.",
  ],
  [
    "A product shows no fees, or the ROI column looks impossible",
    "A row with no fees usually means Amazon has not returned fee data for that ASIN, often because the listing is new, inactive or in a category Apex cannot price. Treat those rows as unknown rather than free. Very large negative ROI in the UPC Scanner normally means the sold price came back as zero, which is the same problem wearing a different hat.",
  ],
  [
    "My team member cannot see a screen I expected them to",
    "Permissions are granted per screen, not per module, so access to Purchase Orders does not imply access to Vendors. Open Authorised Users, select the person, and check each screen they need. If they still cannot see it after a change, have them sign out and back in.",
  ],
  [
    "The repricer is not moving a price",
    "Work through it in this order. Is a strategy assigned to that SKU in Listings? Is the listing in stock — a strategy's out-of-stock fallback may be set to hold? Is the safety cooldown still running from the last move? And is market data fresh enough: if it is older than the maximum data age you set, the engine deliberately stops acting rather than pricing on stale information. Price Activity will usually tell you which of these it was.",
  ],
  [
    "My inventory count in Apex does not match Seller Central",
    "They are measuring different things. Inventory under Apex Red is what you physically hold, including stock sitting at a prep centre or in your own warehouse. Amazon only counts what has reached it and been received. A gap between the two is normally stock in transit, which is visible as a Working or Inbound shipment.",
  ],
];

type NavItem = { id: string; label: string; dot: string };
const NAV: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Getting oriented",
    items: [
      { id: "find", label: "Where do I find…?", dot: "#5c6470" },
      { id: "suite", label: "The five modules", dot: "#5c6470" },
      { id: "flow", label: "The order of work", dot: "#5c6470" },
      { id: "connect", label: "Connecting Amazon", dot: "#5c6470" },
    ],
  },
  {
    title: "The modules",
    items: [
      { id: "black", label: "Apex Black", dot: MODULE.black.accent },
      { id: "blue", label: "Apex Blue", dot: MODULE.blue.accent },
      { id: "green", label: "Apex Green", dot: MODULE.green.accent },
      { id: "red", label: "Apex Red", dot: MODULE.red.accent },
      { id: "gold", label: "Apex Gold", dot: MODULE.gold.accent },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "team", label: "Team & settings", dot: "#5c6470" },
      { id: "trouble", label: "Troubleshooting", dot: "#5c6470" },
      { id: "help", label: "Getting more help", dot: "#5c6470" },
    ],
  },
];

/** Everything search can match against. */
type Hit = { title: string; sub: string; section: string; module: ModuleKey; hay: string };

const SEARCH_INDEX: Hit[] = [
  ...ALL_SCREENS.map((s) => ({
    title: s.name,
    sub: s.routes.join(" · "),
    section: s.section,
    module: s.module,
    hay: `${s.name} ${s.routes.join(" ")} ${s.body}`.toLowerCase(),
  })),
  ...QUICK.map(([task, screen, route, mod]) => ({
    title: task,
    sub: `${screen} · ${route}`,
    section: mod === "general" ? "team" : mod,
    module: mod as ModuleKey,
    hay: `${task} ${screen} ${route}`.toLowerCase(),
  })),
  ...TROUBLE.map(([q, a]) => ({
    title: q,
    sub: "Troubleshooting",
    section: "trouble",
    module: "general" as ModuleKey,
    hay: `${q} ${a}`.toLowerCase(),
  })),
  ...STRATEGY_SETTINGS.map(([name, body]) => ({
    title: `${name} (repricer setting)`,
    sub: "Apex Gold · custom strategy",
    section: "gold",
    module: "gold" as ModuleKey,
    hay: `${name} ${body} repricer strategy`.toLowerCase(),
  })),
  {
    title: "Connecting your Amazon account",
    sub: "Settings",
    section: "connect",
    module: "general",
    hay: "connect amazon account authorise seller central sync setup integration reconnect",
  },
  {
    title: "Permissions for team members",
    sub: "Authorised Users",
    section: "team",
    module: "general",
    hay: "permissions team va assistant access authorised users roles share login",
  },
];

function Anchor({ id }: { id: string }) {
  return (
    <a className="docs-anchor" href={`#${id}`} aria-label="Link to this section">
      #
    </a>
  );
}

/**
 * "Take me to this screen."
 *
 * A real anchor first, so it works with JavaScript off, opens in a new tab on
 * a middle click, and is readable by anything that reads links. The click
 * handler then upgrades it to ApexAuth's session handoff when that script has
 * loaded — apex-auth.js is added globally in layout.tsx, so on this page it
 * normally has.
 *
 * Not subscription-gated on purpose. This is public documentation; bouncing a
 * confused customer to a pricing page when they asked for the Vendors screen
 * would be the opposite of helping.
 */
function OpenInApp({ route, label }: { route: string; label: string }) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle new-tab and modified clicks itself.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const apex = (window as unknown as {
      ApexAuth?: { redirectToApp?: (path?: string) => void };
    }).ApexAuth;
    if (apex?.redirectToApp) {
      e.preventDefault();
      apex.redirectToApp(route);
    }
  };

  return (
    <a
      className="docs-open-screen"
      href={`${APP_URL}${route}`}
      onClick={onClick}
      aria-label={`Open ${label} in Apex`}
    >
      {route}
      <ExternalLink size={12} strokeWidth={2.2} aria-hidden="true" />
    </a>
  );
}

function ScreenTable({ screens }: { screens: Screen[] }) {
  return (
    <div className="docs-screens">
      {screens.map(({ Icon, name, body, routes }) => (
        <div className="docs-screen" key={name + routes[0]}>
          <span className="docs-screen-ico" aria-hidden="true">
            <Icon size={16} strokeWidth={2} />
          </span>
          <div>
            <h4>{name}</h4>
            <p>{body}</p>
          </div>
          <div className="docs-screen-route">
            <span className="docs-open-screens">
              {routes.map((r) => (
                <OpenInApp key={r} route={r} label={name} />
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Figure({
  src,
  title,
  alt,
  caption,
}: {
  src: string;
  title: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="docs-figure">
      <div className="docs-frame">
        <div className="docs-frame-bar">
          <span className="docs-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {title}
        </div>
        <img src={src} alt={alt} loading="lazy" />
      </div>
      <figcaption className="docs-caption">{caption}</figcaption>
    </figure>
  );
}

export default function HowApexWorks() {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [active, setActive] = useState("find");
  const activeRef = useRef(active);
  activeRef.current = active;
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const terms = q.split(/\s+/);
    return SEARCH_INDEX.filter((h) => terms.every((t) => h.hay.includes(t))).slice(0, 8);
  }, [query]);

  useEffect(() => setCursor(0), [query]);

  const goTo = useCallback((sectionId: string) => {
    setQuery("");
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ block: "start" });
      history.replaceState(null, "", `#${sectionId}`);
    }
    inputRef.current?.blur();
  }, []);

  // "/" focuses search from anywhere, the way a reader of any documentation
  // site now expects. Ignored while they are already typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setQuery("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the results when focus or a click leaves the search area.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setQuery("");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Highlights the nav entry for whichever section is near the top of the
  // viewport, so the reader always knows where they are in a long page.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id && visible.target.id !== activeRef.current) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const group of NAV) {
      for (const { id } of group.items) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    }
    return () => observer.disconnect();
  }, []);

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      goTo(results[cursor].section);
    }
  };

  return (
    <div className="docs-page">
      <header className="docs-header">
        <div className="docs-header-in">
          <a className="docs-brand" href={ORIGIN} aria-label="Apex Applications home">
            <img src="/assets/bull.png" alt="" width={39} height={30} />
            <span className="docs-brand-name">Apex</span>
          </a>
          <span className="docs-brand-sep" aria-hidden="true">
            /
          </span>
          <span className="docs-brand-tag">Product guide</span>

          <div className="docs-search" ref={searchRef}>
            <div className="docs-search-field">
              <span className="docs-search-ico" aria-hidden="true">
                <Search size={15} strokeWidth={2.2} />
              </span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search the guide…  /"
                aria-label="Search the guide"
                autoComplete="off"
              />
              {query && (
                <button
                  className="docs-search-clear"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              )}
            </div>

            {query.trim().length >= 2 && (
              <div className="docs-results" role="listbox" aria-label="Search results">
                {results.length === 0 ? (
                  <p className="docs-results-empty">
                    Nothing matched “{query.trim()}”. Try a screen name, or what you are
                    trying to do.
                  </p>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={r.title + r.sub}
                      type="button"
                      role="option"
                      aria-selected={i === cursor}
                      className={`docs-result${i === cursor ? " is-cursor" : ""}`}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => goTo(r.section)}
                    >
                      <span>
                        <strong>{r.title}</strong>
                        <span>{r.sub}</span>
                      </span>
                      <em
                        style={
                          {
                            "--rc": MODULE[r.module].accent,
                            "--rb": MODULE[r.module].soft,
                          } as CSSProperties
                        }
                      >
                        {MODULE[r.module].label}
                      </em>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <a className="docs-open docs-open-primary" href={APP_URL}>
            <span>Open Apex</span>
            <ExternalLink size={14} strokeWidth={2.2} />
          </a>
        </div>
      </header>

      <div className="docs-shell">
        {/* -------------------------------------------------------------- nav */}
        <nav className="docs-nav" aria-label="Guide contents">
          {NAV.map((group) => (
            <div className="docs-nav-group" key={group.title}>
              <p className="docs-nav-title">{group.title}</p>
              <ol>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={active === item.id ? "is-active" : undefined}
                      aria-current={active === item.id ? "true" : undefined}
                      style={{ "--dot": item.dot } as CSSProperties}
                    >
                      <span className="docs-nav-dot" aria-hidden="true" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>

        <main className="docs-main">
          <div className="docs-intro">
            <h1>How Apex works</h1>
            <p>
              A reference for every part of the app: what each module is for, what
              lives on every screen, where to find a given setting, and what to check
              when something looks wrong. Search above, or start with the table below.
            </p>
          </div>

          {/* ------------------------------------------------- where do I find */}
          <section className="docs-section" id="find">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Start here</span>
            </div>
            <h2>
              Where do I find…? <Anchor id="find" />
            </h2>
            <p className="docs-lede">
              The dozen things people open this page looking for. Each row jumps to the
              section that explains it.
            </p>

            <div className="docs-quick">
              <div className="docs-quick-row docs-quick-head" aria-hidden="true">
                <b>I want to…</b>
                <span>Screen</span>
                <span>Route</span>
              </div>
              {QUICK.map(([task, screen, route, mod]) => (
                <div
                  className="docs-quick-row"
                  key={task}
                  style={accentVars(mod as ModuleKey)}
                >
                  {/* The row is a div, not a link: it now contains a button,
                      and an anchor inside an anchor is invalid. The task text
                      carries the jump to the explanation instead. */}
                  <b>
                    <a className="docs-quick-task" href={`#${mod === "general" ? "team" : mod}`}>
                      {task}
                    </a>
                  </b>
                  <span className="docs-quick-where">
                    <span
                      className="docs-eyebrow-dot"
                      style={{ background: MODULE[mod as ModuleKey].accent }}
                      aria-hidden="true"
                    />
                    {screen}
                  </span>
                  <span className="docs-open-screens">
                    <OpenInApp route={route} label={screen} />
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------- the suite */}
          <section className="docs-section" id="suite">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Orientation</span>
            </div>
            <h2>
              The five modules <Anchor id="suite" />
            </h2>
            <p className="docs-lede">
              Apex is one account and one set of numbers, split into five modules named
              by colour. They are separate jobs, not separate logins.{" "}
              <strong>
                A cost you enter in Blue is the cost Green prices against, the cost Red
                ships, and the cost Gold refuses to price below.
              </strong>
            </p>
            <p className="docs-lede">
              You reach all of it from the <strong>Tools</strong> menu in the top bar,
              which groups the screens under the module they belong to.
            </p>

            <div className="docs-table-wrap">
              <div className="docs-table-scroll">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th scope="col">Module</th>
                      <th scope="col">What it is for</th>
                      <th scope="col">Main screens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["black", "The command centre and your learning", "Dashboard, Review Booster, University, Books"],
                        ["blue", "Suppliers, purchase orders and the money", "Vendors, Databases, Purchase Orders, Analytics, Opex"],
                        ["green", "Catalog research at scale", "UPC Scanner, Master Catalog, Brands, Products"],
                        ["red", "Getting stock to Amazon", "Shipments, Warehouses, Inventory, Prep"],
                        ["gold", "Repricing and the Buy Box", "Strategy, Listings, Price Activity"],
                      ] as const
                    ).map(([key, what, screens]) => (
                      <tr key={key}>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              className="docs-eyebrow-dot"
                              style={{ background: MODULE[key].accent }}
                              aria-hidden="true"
                            />
                            <a href={`#${key}`}>{MODULE[key].label}</a>
                          </span>
                        </td>
                        <td>{what}</td>
                        <td>{screens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Figure
              src={SHOT.dashboard}
              title="Apex · Dashboard"
              alt="The Apex dashboard showing Amazon balance, total sales, total profits, gross profit per ASIN, ROI, margin and units sold, each charted against the previous period."
              caption="The dashboard you land on. Every figure is against the previous period, and the date range is yours to set. Example data."
            />
          </section>

          {/* -------------------------------------------------------- the flow */}
          <section className="docs-section" id="flow">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Orientation</span>
            </div>
            <h2>
              The order of work <Anchor id="flow" />
            </h2>
            <p className="docs-lede">
              Wholesale is a loop. This is the circuit the software is built around, and
              the same one the in-app walkthrough puts in front of a new account. If you
              are unsure where you are, find yourself on this line first.
            </p>

            <div className="docs-diagram">
              <span className="docs-diagram-tag">Diagram · the work loop</span>
              <div className="docs-flow">
                {(
                  [
                    ["Suppliers", "Open accounts, get catalogs in", "blue"],
                    ["Scan", "Run the catalog against real fees", "green"],
                    ["Purchase order", "Build and project the order", "blue"],
                    ["Ship & prep", "Get it to Amazon", "red"],
                    ["Price & restock", "Hold the Buy Box, buy again", "gold"],
                  ] as const
                ).map(([title, sub, mod], i, arr) => (
                  <div
                    className={`docs-flow-node${i === arr.length - 1 ? " is-end" : ""}`}
                    key={title}
                    style={accentVars(mod)}
                  >
                    <i>{i + 1}</i>
                    <div>
                      <strong>{title}</strong>
                      <span>{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="docs-note">
              <span className="docs-note-ico" aria-hidden="true">
                <Info size={17} strokeWidth={2} />
              </span>
              <p>
                <strong>Nothing in Apex is a guarantee.</strong> Suppliers decide who
                they open accounts for, Amazon decides selling approvals and who holds
                the Buy Box, and every projection is arithmetic on the costs and prices
                you enter.
              </p>
            </div>
          </section>

          {/* ----------------------------------------------------- connect */}
          <section className="docs-section" id="connect">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Setup</span>
            </div>
            <h2>
              Connecting your Amazon account <Anchor id="connect" />
            </h2>
            <p className="docs-lede">
              Almost everything useful depends on this one connection. Until it exists,
              the dashboard has nothing to total, Analytics has no sales to read, and
              Gold has no listings to price.
            </p>
            <ol className="docs-steps">
              {(
                [
                  ["Open Settings", "Your account menu, top right, then Settings. The Amazon connection sits there alongside your personal details and security."],
                  ["Authorise Apex with Amazon", "You are handed to Amazon to approve the connection and sent back when it is done. Apex is an Amazon-approved application, so this is the normal Seller Central authorisation flow rather than handing over a password."],
                  ["Let the first sync run", "Orders, listings, fees and settlement data come across in batches. Figures fill in as they land rather than all at once."],
                  ["Add your costs", "Amazon knows what you sold something for, not what you paid. Cost of goods goes in through Update COGS or arrives with a purchase order, and it is what turns revenue into profit everywhere else."],
                  ["Turn on two-factor authentication", "In Settings, next to Sessions, which lists every device signed in. Worth doing on an account that holds your supplier logins."],
                ] as const
              ).map(([title, body]) => (
                <li key={title}>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* --------------------------------------------------------- BLACK */}
          <section className="docs-section" id="black" style={accentVars("black")}>
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" />
              <span>Apex Black</span>
            </div>
            <h2>
              The command centre <Anchor id="black" />
            </h2>
            <p className="docs-lede">
              Black is what you see when you sign in, and the part of Apex that answers
              &ldquo;how is the business doing&rdquo; without opening anything else. It
              also holds the two things that are not operations: the learning, and the
              reviews.
            </p>
            <ScreenTable screens={BLACK_SCREENS} />
            <Figure
              src={SHOT.reviewBooster}
              title="Apex Black · Review Booster"
              alt="The Apex Review Booster screen, which automates the review and seller feedback requests permitted on Amazon orders."
              caption="Review Booster sends the requests Amazon permits, on the orders that qualify. It cannot influence what a buyer writes. Example data."
            />
          </section>

          {/* ---------------------------------------------------------- BLUE */}
          <section className="docs-section" id="blue" style={accentVars("blue")}>
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" />
              <span>Apex Blue</span>
            </div>
            <h2>
              Suppliers, orders and the money <Anchor id="blue" />
            </h2>
            <p className="docs-lede">
              The commercial half of the business.{" "}
              <strong>
                If a question involves who you buy from, what you paid, or whether it was
                worth it, the answer is in Blue.
              </strong>{" "}
              It is also where the purchase order is built, which is the most
              consequential screen in the suite: everything downstream inherits the
              decisions made there.
            </p>
            <ScreenTable screens={BLUE_SCREENS} />

            <Figure
              src={SHOT.vendors}
              title="Apex Blue · Vendors"
              alt="The Apex Vendors screen listing suppliers with websites, account numbers, contacts, lead times, requirements and payment methods, with vendor spend and top products above."
              caption="Vendors. Stated lead time and actual lead time sit side by side on purpose — the gap between them is what a restock plan lives or dies on. Example data."
            />
            <Figure
              src={SHOT.purchaseOrders}
              title="Apex Blue · Purchase Orders"
              alt="The Apex Purchase Orders screen with a projection of total revenue, expenses and profit, above individual supplier orders showing cost of goods, units purchased and margin."
              caption="A purchase order with its projection. Change a quantity and revenue, expenses and profit move with it, before anything is sent."
            />
            <Figure
              src={SHOT.inventory}
              title="Apex Blue · Analytics · Inventory"
              alt="The Apex Analytics inventory view showing stock value, profit, available units and gross profit per ASIN, with items to restock, sales velocity and days of inventory per product."
              caption="The Inventory half of Analytics. Days of inventory and days until next order are the two columns that say when to buy again; Create New PO carries the selection into Purchase Orders."
            />

            <h3>
              Why Operating Expenses matters <Anchor id="blue" />
            </h3>
            <p className="docs-lede">
              This is the screen most sellers skip, and skipping it is why a business can
              look profitable per unit and still lose money per month. Without operating
              expenses recorded, the profit figure in Analytics is gross margin wearing a
              costume.
            </p>
            <Figure
              src={SHOT.opex}
              title="Apex Blue · Operating Expenses"
              alt="The Apex operating expenses dashboard, recording recurring business costs outside cost of goods."
              caption="Software, prep, freight, salaries: the costs that never appear on a product but always appear on a bank statement. Example data."
            />
          </section>

          {/* --------------------------------------------------------- GREEN */}
          <section className="docs-section" id="green" style={accentVars("green")}>
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" />
              <span>Apex Green</span>
            </div>
            <h2>
              Finding what is worth buying <Anchor id="green" />
            </h2>
            <p className="docs-lede">
              Research at catalog scale. A distributor price list is not ten products you
              evaluate carefully, it is several thousand rows of which a handful might
              work, and the job is finding that handful without spending a week on it.
            </p>
            <ScreenTable screens={GREEN_SCREENS} />
            <Figure
              src={SHOT.upcScanner}
              title="Apex Green · UPC Scanner"
              alt="The Apex UPC Scanner showing a supplier catalog as rows of products with landed cost, current and average sold prices, profit, ROI, margin, FBA fees, referral fees and shipping per line."
              caption="The UPC Scanner mid-catalog. Fees are already subtracted, so profit and ROI are what would actually be left. Example data."
            />
            <Figure
              src={SHOT.masterCatalog}
              title="Apex Green · Master Catalog"
              alt="The Apex Master Catalog screen, where vendor catalogs are merged and managed in one place."
              caption="Every vendor sends a different spreadsheet. This is where that stops being a different problem each time. Example data."
            />
          </section>

          {/* ----------------------------------------------------------- RED */}
          <section className="docs-section" id="red" style={accentVars("red")}>
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" />
              <span>Apex Red</span>
            </div>
            <h2>
              Getting the stock to Amazon <Anchor id="red" />
            </h2>
            <p className="docs-lede">
              The logistics half: the stretch between a supplier accepting your order and
              Amazon marking the units receivable.{" "}
              <strong>It has two sides, because both ends of that relationship use Apex.</strong>{" "}
              Sellers manage shipments, warehouses and inventory; prep centres manage
              their merchants, billing and payment structures against the same shipments.
            </p>

            <div className="docs-diagram">
              <span className="docs-diagram-tag">Diagram · shipment stages</span>
              <div className="docs-flow">
                {(
                  [
                    ["Draft", "Choosing what goes, and how much"],
                    ["Inbound", "On its way to prep or your warehouse"],
                    ["Working", "Being received, counted and prepped"],
                    ["Amazon", "Shipped in and receivable"],
                  ] as const
                ).map(([title, sub], i, arr) => (
                  <div
                    className={`docs-flow-node${i === arr.length - 1 ? " is-end" : ""}`}
                    key={title}
                  >
                    <i>
                      {i === arr.length - 1 ? (
                        <PackageCheck size={16} strokeWidth={2.3} />
                      ) : (
                        i + 1
                      )}
                    </i>
                    <div>
                      <strong>{title}</strong>
                      <span>{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ScreenTable screens={RED_SCREENS} />

            <p className="docs-lede" style={{ marginTop: 22 }}>
              When you send a shipment to a prep centre you are asked for the details
              that decide how it is handled: the product, its case pack, bundle quantity,
              the shipment quantity and the units expected. Those travel with the
              shipment, so the prep centre works from your numbers rather than a guess at
              the receiving bay.
            </p>
          </section>

          {/* ---------------------------------------------------------- GOLD */}
          <section className="docs-section" id="gold" style={accentVars("gold")}>
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" />
              <span>Apex Gold</span>
            </div>
            <h2>
              Repricing and the Buy Box <Anchor id="gold" />
            </h2>
            <p className="docs-lede">
              Gold is the repricer. The problem it solves is that the two obvious
              approaches are both wrong: never move your price and you lose the Buy Box,
              always be cheapest and you win a race to the bottom you have to keep
              paying for.{" "}
              <strong>A strategy is how you say which trade you are willing to make.</strong>
            </p>

            <div className="docs-diagram">
              <span className="docs-diagram-tag">Diagram · the four strategies</span>
              <div className="docs-strats">
                {STRATEGIES.map(({ Icon, name, tagline, fg, bg }) => (
                  <div
                    className="docs-strat"
                    key={name}
                    style={{ "--sc": fg, "--sb": bg } as CSSProperties}
                  >
                    <span className="docs-strat-ico" aria-hidden="true">
                      <Icon size={16} strokeWidth={2.1} />
                    </span>
                    <h4>{name}</h4>
                    <p>{tagline}</p>
                  </div>
                ))}
              </div>
            </div>

            <ScreenTable screens={GOLD_SCREENS} />

            <h3>
              Every setting in a custom strategy <Anchor id="gold" />
            </h3>
            <p className="docs-lede">
              A custom strategy is saved, named and assignable to any SKU, so &ldquo;how I
              price hardware&rdquo; becomes something you configure once. These are the
              groups the builder walks you through, in order.
            </p>
            <div className="docs-table-wrap">
              <div className="docs-table-scroll">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th scope="col">Group</th>
                      <th scope="col">What you are deciding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STRATEGY_SETTINGS.map(([name, body]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{body}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="docs-note" style={{ "--nc": MODULE.gold.accent } as CSSProperties}>
              <span className="docs-note-ico" aria-hidden="true">
                <Info size={17} strokeWidth={2} />
              </span>
              <p>
                <strong>Safety is the group worth reading twice.</strong> Your floor can
                be derived from the costs already in Apex rather than typed in, which
                means a repricer that knows what you paid cannot price you into a loss.
                Amazon decides who holds the Buy Box; no repricer can promise it.
              </p>
            </div>
          </section>

          {/* ---------------------------------------------------------- TEAM */}
          <section className="docs-section" id="team">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Account</span>
            </div>
            <h2>
              Team &amp; settings <Anchor id="team" />
            </h2>
            <p className="docs-lede">
              A VA who books shipments does not need to see your margins, and a
              bookkeeper does not need your supplier passwords. Apex handles this with
              authorised users and per-screen permissions rather than one shared login.
            </p>
            <ScreenTable screens={SETTINGS_SCREENS} />

            <h3>
              Permissions you can grant <Anchor id="team" />
            </h3>
            <p className="docs-lede">
              Granted per screen, not per module — access to Purchase Orders does not
              imply access to Vendors.
            </p>
            <div className="docs-table-wrap">
              <div className="docs-table-scroll">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th scope="col">Permission</th>
                      <th scope="col">Gives access to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSIONS.map((p) => (
                      <tr key={p}>
                        <td>{p}</td>
                        <td>The {p} screen and the actions available on it.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------- TROUBLE */}
          <section className="docs-section" id="trouble">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Account</span>
            </div>
            <h2>
              Troubleshooting <Anchor id="trouble" />
            </h2>
            <p className="docs-lede">
              The things that go wrong most often, and what to check first.
            </p>
            <div className="docs-trouble">
              {TROUBLE.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <i aria-hidden="true">+</i>
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ---------------------------------------------------------- HELP */}
          <section className="docs-section" id="help">
            <div className="docs-eyebrow">
              <span className="docs-eyebrow-dot" style={{ background: "#5c6470" }} />
              <span style={{ color: "#5c6470" }}>Account</span>
            </div>
            <h2>
              Getting more help <Anchor id="help" />
            </h2>
            <p className="docs-lede">
              Inside the app, <strong>Help</strong> holds walkthrough videos for the Blue
              screens — Vendors, Databases, Purchase Orders, Analytics and Opex — which
              are the ones with the most going on.
            </p>
            <p className="docs-lede">
              <strong>Apex University</strong> covers the business rather than the
              buttons: what wholesale is, how to be taken seriously by a distributor, how
              to decide what is worth buying, and how to place and restock an order.
              There is also an <strong>AI Mentor</strong> in the top bar, and{" "}
              <strong>Send feedback</strong> beside it, which reaches us. For anything
              else, <a href={`${ORIGIN}/contact-us`} style={{ color: "#2563eb", fontWeight: 600 }}>contact support</a>.
            </p>
            <Figure
              src={SHOT.university}
              title="Apex Black · Apex University"
              alt="The Apex University screen showing the wholesale course modules as video lessons grouped by topic."
              caption="Apex University, inside the account. Modules are grouped in the order you would work through them."
            />
          </section>
        </main>
      </div>

      <footer className="docs-footer">
        <div className="docs-footer-in">
          <div className="docs-footer-row">
            <span>© {new Date().getFullYear()} Apex Applications · Product guide</span>
            <nav aria-label="Footer">
              <a href={`${ORIGIN}/how-it-works`}>How it works</a>
              <a href={`${ORIGIN}/pricing`}>Pricing</a>
              <a href={`${ORIGIN}/contact-us`}>Contact</a>
              <a href={`${ORIGIN}/privacy`}>Privacy</a>
              <a href={`${ORIGIN}/terms`}>Terms</a>
            </nav>
          </div>
          <p className="docs-fineprint">
            Screenshots show the Apex application with example data. Figures are
            calculated from the costs and prices entered and are projections, not
            statements of results. Supplier acceptance, stock, pricing and terms are
            decided by each supplier. Amazon decides selling approvals and which offer
            holds the Buy Box. Amazon is a trademark of Amazon.com, Inc. or its
            affiliates.
          </p>
        </div>
      </footer>
    </div>
  );
}
