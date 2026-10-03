"use client";

/**
 * Apex POP — the Purchase Order Program landing page.
 *
 * One job: get a reader to book a working session that ends in a purchase
 * order. Everything on the page is bent toward that and nothing else is sold
 * here — no plan, no price, no bundle. The offer is the meeting.
 *
 * Two constraints shaped the copy and are worth keeping if this is edited.
 *
 * It must not read as a course. The audience for this page has already bought
 * courses; the positioning is the opposite of one, so the denial is made
 * explicitly near the top rather than implied. Apex University exists and is
 * referenced once, as a place to look something up mid-order, never as the
 * thing being sold.
 *
 * It must not promise outcomes. Suppliers decide who they open accounts for,
 * Amazon decides selling approvals, and the builder's projections are
 * arithmetic on inputs the seller supplies — not forecasts. Those three
 * disclaimers are load-bearing and appear in the FAQ and the footer.
 *
 * Visually this is a sibling of /zero-to-hero: same shared surface, same mesh
 * background, same blue block marking the key phrase in the headline, same
 * sheen crossing the large CTAs. The two pages sell adjacent things to the
 * same audience and should look like they came from one company.
 *
 * Every screenshot is a real Apex screen pulled from the assets the rest of
 * the site already ships, so the page shows the software that does the work
 * rather than an illustration of it.
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Boxes,
  Building2,
  Candy,
  Check,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  HeartPulse,
  Lock,
  PawPrint,
  ScanBarcode,
  Users,
  Wallet,
} from "lucide-react";

import "./apex-surface.css";
import "./apex-pop.css";
import TrustpilotBadge, { type TrustpilotFigures } from "./TrustpilotBadge";
import { DOLLAR_WEEK, TAX_SUFFIX } from "../config/offer";

const ORIGIN = "https://www.apexapplications.io";

/**
 * The booking link the whole page points at.
 *
 * Same Calendly the rest of the site books into, with utm_term set so a
 * booking that came from this page is identifiable in the calendar without
 * anyone having to ask the caller where they came from.
 */
const BOOK_BASE = "https://calendly.com/apexapplications-info/new-meeting";

/** Real Apex screens, served from the same asset paths the product pages use. */
const SHOT = {
  purchaseOrders:
    "/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png",
  upcScanner:
    "/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png",
  vendors: "/images/vendors-with-products.webp",
} as const;

/**
 * Lights the sheen once, the moment the element is properly on screen.
 *
 * Same hook /zero-to-hero uses, for the same reason: the class is returned
 * rather than the animation run directly, so `prefers-reduced-motion` can
 * switch it off in one CSS rule.
 */
function useSheen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setLit(true), 120);
    return () => clearTimeout(t);
  }, [inView]);
  return { ref, className: lit ? "cta-shine is-lit" : "cta-shine" };
}

/**
 * The six steps, in the order they are worked.
 *
 * `key` marks the two that carry the positioning: setting capital before
 * choosing product is the step a course never makes you do, and building the
 * PO is the thing the page is named after.
 */
const STEPS = [
  {
    n: "Step 01",
    rail: "Suppliers",
    Icon: Building2,
    title: "Start from suppliers you can actually buy from.",
    body: "Put the accounts you already have into Vendors, and work the list for the ones you do not. Catalogs requested, account requirements noted, minimums and payment terms written down in one place instead of across eleven email threads.",
    outcome: "A shortlist of suppliers that will sell to you.",
    tool: "Vendors",
  },
  {
    n: "Step 02",
    rail: "Analyze",
    Icon: ScanBarcode,
    title: "Run the whole catalog, not the ten products you remember.",
    body: "Load a supplier price list into the UPC Scanner and read it line by line: landed cost against current sold price, FBA and referral fees, shipping, margin and ROI. Most of a catalog does not work. This is how you find the part that might.",
    outcome: "A filtered list of products worth a second look.",
    tool: "UPC Scanner",
  },
  {
    n: "Step 03",
    rail: "Learn",
    Icon: GraduationCap,
    title: "Learn the one thing blocking this order.",
    body: "Not a forty-hour curriculum. If the hold-up is ungating, or prep, or what a distributor expects from a new reseller, you look up that piece in Apex University at the moment it is in your way, and then you carry on building.",
    outcome: "The specific answer you were stuck on.",
    tool: "Apex University",
  },
  {
    n: "Step 04",
    rail: "Set capital",
    Icon: Wallet,
    title: "Decide the number before you fall in love with a product.",
    body: "How much you are putting into this order, what stays in reserve, and what is left for the one after it. The order gets built to fit the capital. Doing it the other way round is how a first order turns into stock you cannot restock.",
    outcome: "A budget the purchase order has to fit inside.",
    tool: "Your numbers",
    key: true,
  },
  {
    n: "Step 05",
    rail: "Meet with Apex",
    Icon: Users,
    title: "Go through it with someone who has bought before.",
    body: "Bring the shortlist and the number to a working session with our team. We go through the products you are considering, the costs you have entered and the order you are shaping, and you leave the call knowing what the next move is.",
    outcome: "Your decisions made out loud, with a second opinion.",
    tool: "Live session",
  },
  {
    n: "Step 06",
    rail: "Build the PO",
    Icon: ClipboardCheck,
    title: "Build the purchase order and see it before you send it.",
    body: "Quantities, cost of goods, Amazon fees, shipping and prep go into the Purchase Order Builder, and it returns the projection: total revenue, total expenses, profit, margin and ROI on the order as configured. Change a quantity and watch it move.",
    outcome: "A purchase order you can actually send to a supplier.",
    tool: "Purchase Order Builder",
    key: true,
  },
] as const;

const DENIALS = [
  [
    "Not another course",
    "Nothing to binge and nothing to finish. You already know more about wholesale than your order history shows.",
  ],
  [
    "Not get-rich-quick",
    "Buying inventory is a business decision with real downside. We are here to help you make it carefully, not quickly.",
  ],
  [
    "Not a guarantee",
    "Suppliers choose who they open accounts for and Amazon decides selling approvals. We help you prepare for both.",
  ],
] as const;

const DELIVERABLES = [
  {
    Icon: Boxes,
    title: "A supplier shortlist",
    body: "The accounts you can buy from now, with their terms and minimums recorded, not remembered.",
  },
  {
    Icon: FileSpreadsheet,
    title: "A scanned catalog",
    body: "A supplier price list run against real Amazon fees, narrowed to the lines that survive the maths.",
  },
  {
    Icon: Wallet,
    title: "A capital figure",
    body: "A number you chose deliberately for this order, with the rest of your cash accounted for.",
  },
  {
    Icon: ClipboardList,
    title: "A purchase order",
    body: "Units, costs and a full projection, built in Apex and ready to go to the supplier.",
  },
] as const;

/**
 * What a first supplier drop looks like, for the pages that lead with the
 * suppliers. Categories are three of the network's real ones; the names stay
 * blurred because they are what signing up unlocks, the same rule the app's
 * distributor map follows for locked pins. Network counts are the roster in
 * src/data/distributors.ts.
 */
const DROP = [
  {
    Icon: HeartPulse,
    category: "Health & Supplements",
    blur: "Northfield Health Supply",
  },
  { Icon: Candy, category: "Candy & Snacks", blur: "Brightway Confections" },
  { Icon: PawPrint, category: "Pet Supplies", blur: "Coastal Pet Wholesale" },
] as const;
const DROP_PERKS = [
  "Sells to Amazon resellers",
  "Named contact who approves you",
  "Full catalog, ready to scan",
] as const;
const NETWORK = { distributors: 389, categories: 14 } as const;

/**
 * The suppliers made visible: the real Vendors screen with the products it
 * holds, the drop itself as cards, and the purchase order Short playing in a
 * phone frame. Replaces a block of text that told a phone visitor what they
 * get without ever showing it.
 */
function SupplierShowcase({
  video,
}: {
  video: { id: string; title: string; length: string };
}) {
  // Lazy, muted and looping: it starts as it scrolls into view and costs
  // nothing for anyone who never gets this far down.
  const embed = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="pop-sup">
      <figure className="pop-sup-hero">
        <img
          src={SHOT.vendors}
          alt="The Apex Vendors screen listing wholesale suppliers, surrounded by the kind of name-brand products they carry: Colgate, Tide, Dove, Pampers, Huggies, Bounty, LEGO and Purina."
          loading="lazy"
        />
      </figure>

      <div className="pop-sup-drop">
        <div className="pop-sup-drop-head">
          <p className="pop-label">Your first drop</p>
          <p className="pop-sup-net">
            From a network of <b>{NETWORK.distributors}</b> US distributors
            across <b>{NETWORK.categories}</b> categories
          </p>
        </div>
        <ol className="pop-sup-cards">
          {DROP.map(({ Icon, category, blur }, i) => (
            <li className="pop-sup-card" key={category}>
              <div className="pop-sup-card-top">
                <span className="pop-sup-ico" aria-hidden="true">
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <span className="pop-sup-num">Supplier {i + 1}</span>
              </div>
              <p className="pop-sup-cat">{category}</p>
              <p className="pop-sup-name">
                <span className="pop-sup-blur" aria-hidden="true">
                  {blur}
                </span>
                <span className="pop-sup-lock">
                  <Lock size={12} strokeWidth={2.6} aria-hidden="true" />
                  Unlocks when you sign up
                </span>
              </p>
              <ul className="pop-sup-perks">
                {DROP_PERKS.map((p) => (
                  <li key={p}>
                    <Check size={15} strokeWidth={3} aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li className="pop-sup-card pop-sup-more">
            <span className="pop-sup-plus">+3</span>
            <p className="pop-sup-cat">More next month</p>
            <p className="pop-sup-more-copy">
              A new drop lands every month you&rsquo;re with us.
            </p>
          </li>
        </ol>
      </div>

      <div className="pop-sup-video">
        <div className="pop-sup-video-copy">
          <p className="pop-label">Watch it work · {video.length}</p>
          <h3>From a supplier&rsquo;s catalog to a purchase order.</h3>
          <p>
            A real price list goes into Apex, the products that still make money
            after Amazon&rsquo;s fees float to the top, and the order gets built
            from them. Start to finish in under two minutes.
          </p>
          <ul className="pop-shot-list">
            <li>
              <span aria-hidden="true">→</span> Every line checked against real
              Amazon fees
            </li>
            <li>
              <span aria-hidden="true">→</span> Profit, ROI and margin on each
              product
            </li>
            <li>
              <span aria-hidden="true">→</span> The purchase order totals before
              you send it
            </li>
          </ul>
        </div>
        <div className="pop-sup-phone">
          <iframe
            src={embed}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The button while the $1 week is on. "Try Apex free" beside a $1 note is
 * the mismatch the page exists to avoid, so the opening is swapped and the
 * rest of the page's label kept.
 */
const dollarLabel = (label: string) =>
  label.replace(/^Try Apex free/, `Start Apex for $${DOLLAR_WEEK.price}`);

/**
 * What a scan looks like, small enough to sit under the hero button: four
 * lines of a supplier catalog coming back profitable or not. Example rows,
 * labelled as such; the real thing is the UPC Scanner further down.
 */
const SCAN_ROWS = [
  { name: "Pet supply, 12 pack", roi: "+38% ROI", keep: true },
  { name: "Snack variety box", roi: "Skip", keep: false },
  { name: "Vitamin D3, 2 ct", roi: "+27% ROI", keep: true },
  { name: "Kitchen towel set", roi: "Skip", keep: false },
] as const;

function HeroScan() {
  return (
    <figure className="pop-scan" aria-label="Example catalog scan">
      <figcaption className="pop-scan-head">
        <span className="pop-scan-dot" aria-hidden="true" />
        Catalog scan · checked against Amazon fees
      </figcaption>
      <ul>
        {SCAN_ROWS.map((row, i) => (
          <li key={row.name} data-keep={row.keep} style={{ animationDelay: `${0.25 + i * 0.22}s` }}>
            <span>{row.name}</span>
            <b>{row.roi}</b>
          </li>
        ))}
      </ul>
      <p className="pop-scan-note">Example rows. Your scan uses your supplier&rsquo;s real prices.</p>
    </figure>
  );
}

/** The same, in one line, for the ad hero where every line of the first screen counts. */
const dollarSubShort = `Your first ${DOLLAR_WEEK.days} days for $${DOLLAR_WEEK.price}`;

/** What the button promises while the $1 week is on. */
const dollarSub = `$${DOLLAR_WEEK.price} for your first ${DOLLAR_WEEK.days} days. Scan a supplier catalog and build a purchase order in it.`;

/**
 * The $1 week, said once beside each button: the offer in one line, the
 * terms under it in small print. The refund is automatic on any cancel
 * inside the week (services/stripe/dollarWeek.ts), which is what lets this
 * say 100%.
 */
function DollarWeekNote() {
  const { price, days, planLabel, thenPrice } = DOLLAR_WEEK;
  return (
    <div className="pop-dollar">
      <p className="pop-dollar-line">
        <b>${price} trial.</b>{" "}
        100% refund if you&rsquo;re not satisfied within {days} days.
      </p>
      <p className="pop-dollar-fine">
        Apex {planLabel} is ${price} for your first {days} days, then $
        {thenPrice}/month{TAX_SUFFIX}. Cancel from your dashboard before day{" "}
        {days} and we refund your ${price} automatically.
      </p>
    </div>
  );
}

/**
 * Every tool in the app, grouped the way its Tools menu groups them, for
 * the "all in one" block (Stefano, 2026-10-03). Rebuilt as markup rather
 * than a screenshot of the menu: five columns of small type are unreadable
 * on a phone, and the menu screenshot carried a customer's dashboard.
 */
const SUITE = [
  {
    module: "Apex Black",
    area: "Your business",
    bull: "/__l5e/assets-v1/a0c4a52b-a77b-4b9a-b0ab-bc2869ea2c95/bull-black.png",
    tools: [
      ["Dashboard", "Your Amazon business at a glance"],
      ["Review Booster", "Review requests on every order"],
      ["Apex University", "The wholesale blueprint"],
      ["Authorized FBA Distributors", "Vetted US wholesalers and who to contact"],
      ["Rewards & Benefits", "Prep centers, playbooks and perks"],
    ],
  },
  {
    module: "Apex Blue",
    area: "Operations",
    bull: "/__l5e/assets-v1/b3e15893-18f1-44d2-aebb-f3ab4aaf9bcd/bull-blue.png",
    tools: [
      ["Analytics", "Financials and restock planning"],
      ["Vendors", "Every supplier organized"],
      ["Databases", "Market data for your listings"],
      ["Ungating", "Brands worth getting approved for"],
      ["Purchase Orders", "Build and track every order"],
      ["Opex", "Your operating expenses"],
    ],
  },
  {
    module: "Apex Green",
    area: "Sourcing",
    bull: "/__l5e/assets-v1/92204b1e-f18c-4fa0-a40f-8765b8f8778e/bull-green.png",
    tools: [
      ["Master Catalog", "All your vendors' catalogs in one"],
      ["UPC Scanner", "Match a price list to Amazon listings"],
      ["Brands", "Every brand on Amazon"],
      ["Products", "New listings and opportunities"],
    ],
  },
  {
    module: "Apex Red",
    area: "Logistics",
    bull: "/__l5e/assets-v1/496a6fdc-4714-4c12-a2e2-39a484ee8a80/apex-red-bull.png",
    tools: [
      ["Shipments", "Create and track shipments"],
      ["Warehouses", "Ship-from addresses and prep centers"],
      ["Inventory", "What is in each warehouse"],
      ["Prep Chat", "Live chat with your prep center"],
      ["Prep Billing", "Your prep center bills"],
    ],
  },
  {
    module: "Apex Gold",
    area: "Repricing",
    bull: "/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png",
    tools: [
      ["Listings", "Repricing rules on live listings"],
      ["Strategy", "Build repricing strategies"],
      ["Price Activity", "Every price change it made"],
    ],
  },
] as const;
const SUITE_TOOL_COUNT = SUITE.reduce((n, group) => n + group.tools.length, 0);

function AllInOne() {
  return (
    <article className="pop-suite">
      <div className="pop-suite-copy">
        <p className="pop-label">All in one</p>
        <h3>
          {SUITE_TOOL_COUNT} tools. <span className="pop-blue">One login.</span>
        </h3>
        <p>
          From the first supplier to the repricer: sourcing, purchase orders, inventory, prep and repricing in one place,
          instead of a stack of separate subscriptions that never talk to each other.
        </p>
      </div>
      <figure className="pop-frame glow-edge pop-suite-frame">
        <div className="pop-frame-bar">
          <span className="pop-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="pop-frame-title">Apex · Tools</span>
        </div>
        <div className="pop-suite-grid">
          {SUITE.map((group) => (
            <section key={group.module} className="pop-suite-col" aria-label={`${group.module}, ${group.area}`}>
              <header>
                <img src={group.bull} alt="" width={36} height={22} loading="lazy" />
                <span>
                  <b>{group.module}</b>
                  <small>{group.area}</small>
                </span>
              </header>
              <ul>
                {group.tools.map(([name, line]) => (
                  <li key={name}>
                    <b>{name}</b>
                    <small>{line}</small>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </figure>
      <p className="pop-suite-note">Some tools depend on your plan: the repricer (Apex Gold) is on Pro.</p>
    </article>
  );
}

const FAQS: readonly (readonly [string, string])[] = [
  [
    "Is Apex POP a course?",
    "No. Apex University already exists inside the software and you can look things up in it whenever an order needs it. POP is the opposite of sitting down to study: it is a working process with our team that ends in a purchase order you have actually built.",
  ],
  [
    "Do you guarantee supplier accounts, selling approvals or profit?",
    "No. Every supplier sets its own account requirements and decides who it opens an account for. Amazon decides selling approvals. The figures in the Purchase Order Builder are arithmetic on the costs and prices you enter, so they are projections, not guarantees of what an order will return.",
  ],
  [
    "I have not placed an order before. Is this too early for me?",
    "No, that is the first half of the name. The process starts before your first order: suppliers, then the catalog, then the number you are comfortable committing. If you have already sold, the same six steps build your next one.",
  ],
  [
    "Do I need capital ready?",
    "You need to be at the point where buying inventory is the next real step. POP is about deploying capital deliberately rather than telling you how much to spend. What you commit to an order is your decision.",
  ],
  [
    "What actually happens on the call?",
    "We look at where you are: which suppliers you have, what the catalog analysis turned up, and what you are prepared to put into this order. Then we work through shaping the purchase order around it. It is a working session about your order, not a presentation.",
  ],
  [
    "Does this require the Apex software?",
    "The process runs on the Apex suite — Vendors for suppliers, the UPC Scanner for catalogs, the Purchase Order Builder for the order itself. We will go through what your setup needs on the call.",
  ],
];

/**
 * The same page in two frames.
 *
 * `own` is the paid-traffic version: the page carries its own one-button
 * header and its own footer with the ad disclaimers, and nothing on it leads
 * anywhere but the booking. `site` drops both and lets the regular site
 * header and footer wrap the content instead — the version PrimeWell
 * applicants are sent to, who should be able to reach Features, Pricing and
 * sign-up from it because they arrived as customers of another business,
 * not from an ad. Each frame books with its own utm_term so the calendar
 * says which one the caller came through.
 */
/** Sections a page can leave out with the `hide` prop. */
export type PopSection =
  | "denial"
  | "problem"
  | "flow"
  | "software"
  | "outcome"
  | "fit"
  | "faq"
  | "close"
  | "disclaimer"
  | "heroFine";

export default function ApexPop({
  chrome = "own",
  utmTerm = "apex-pop",
  cta,
  trustpilot,
  hide = [],
  software,
  showcase,
  dollarWeek: offersDollarWeek = false,
  hero,
  bare = false,
  form,
}: {
  chrome?: "own" | "site";
  utmTerm?: string;
  /**
   * What the big buttons do. By default they book the working session. The
   * PrimeWell version sends applicants into Apex on a free account instead,
   * to build their next order in the software, with the booking as the
   * quieter second choice.
   */
  cta?: { label: string; sub: string; href: string; secondaryLabel?: string };
  /**
   * Social proof under the hero button: the Trustpilot score and review
   * count, linking to the profile. Off unless a page passes it.
   */
  trustpilot?: TrustpilotFigures;
  /**
   * Sections a page leaves out. The PrimeWell version trims the page down
   * to what an applicant needs; the ad pages show everything.
   */
  hide?: PopSection[];
  /** Replaces the label, heading and lede of the software section. */
  software?: { label?: ReactNode; title?: ReactNode; lede?: ReactNode };
  /**
   * Leads the software section with the suppliers themselves: the Vendors
   * screen with its products, the first drop as cards, and the purchase
   * order video. The Vendors walkthrough below it is then dropped, since
   * the showcase already shows that screen.
   */
  showcase?: { video: { id: string; title: string; length: string } };
  /**
   * The page sends people into the funnel that sells the $1 week, so it may
   * mention it beside the buttons. Shown only while DOLLAR_WEEK.live is on
   * (or with ?dollarweek=1 to preview), because the qualifier only sells the
   * week then, and a page must not promise a refund on a dollar nobody pays.
   */
  dollarWeek?: boolean;
  /**
   * Replaces the hero's eyebrow, headline and paragraph, and adds the small
   * catalog-scan card under the button. For cold ad traffic on a phone: the
   * default hero spent the whole first screen on two paragraphs about the
   * program, and 63 of the first 66 Facebook visitors left from it.
   */
  hero?: { eyebrow: ReactNode; title: ReactNode; sub: ReactNode };
  /** No site header above the page (Navigation renders none for it), so no room is kept for one. */
  bare?: boolean;
  /**
   * A lead form shown in the hero instead of the big button. The header and
   * closing buttons then scroll back up to it rather than leaving the page,
   * so the page asks for the details before anything else.
   */
  form?: ReactNode;
}) {
  const hidden = new Set(hide);
  // Read after mount so the server render and the first client render agree.
  const [dollarPreview, setDollarPreview] = useState(false);
  useEffect(() => {
    setDollarPreview(
      new URLSearchParams(window.location.search).get("dollarweek") === "1",
    );
  }, []);
  const showDollar = offersDollarWeek && (DOLLAR_WEEK.live || dollarPreview);
  const dollarNote = showDollar ? <DollarWeekNote /> : null;
  // A preview has to reach the qualifier's $1 step too, or the click-through
  // lands on the free version and the preview tells you nothing.
  const carry = (href: string) =>
    showDollar && !DOLLAR_WEEK.live && href.includes("/apex-pop/start")
      ? `${href}${href.includes("?") ? "&" : "?"}dollarweek=1`
      : href;
  const BOOK_URL = `${BOOK_BASE}?utm_term=${encodeURIComponent(utmTerm)}`;
  const primary = cta ?? {
    label: "Build my first or next PO",
    sub: "Book a working session with the Apex team",
    href: BOOK_URL,
  };
  const sited = chrome === "site";
  const primaryHref = form ? "#get-started" : primary.href;
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroSheen = useSheen<HTMLAnchorElement>();
  const closeSheen = useSheen<HTMLAnchorElement>();

  // The hero screenshot lifts a little as it enters, which reads as the
  // product coming forward rather than as an animation for its own sake.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start 0.85", "end 0.35"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], [26, 0]);
  const artOpacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);

  return (
    <div className={"apex-surface pop-page" + (sited ? " pop-page-sited" : "") + (bare ? " pop-page-bare" : "")}>
      {!sited && (
        <header className="pop-header">
          <div className="pop-header-in">
            <a
              className="pop-brand"
              href={ORIGIN}
              aria-label="Apex Applications home"
            >
              <img src="/assets/bull.png" alt="" width={54} height={42} />
              <span className="pop-brand-name">
                APEX
                <small>APPLICATIONS</small>
              </span>
            </a>
            <div className="pop-header-right">
              <span className="pop-header-note">Purchase Order Program</span>
              <a className="pop-cta pop-cta-sm" href={primaryHref}>
                <span className="pop-cta-row">
                  {cta ? "Get started" : "Build my PO"}
                  <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>
        </header>
      )}

      <main>
        {/* ------------------------------------------------------------ hero */}
        <section className="pop-hero mesh-bg" ref={heroRef}>
          <div className="pop-shell pop-hero-in">
            <p className="pop-label pop-eyebrow">
              {hero?.eyebrow ?? "Apex POP · Purchase Order Program"}
            </p>

            <h1 className={hero ? "pop-hero-h1-tight" : undefined}>
              {hero?.title ?? (
                <>
                  Build your first or next Amazon wholesale{" "}
                  <mark>purchase order</mark> with Apex.
                </>
              )}
            </h1>

            <p className={hero ? "pop-hero-sub pop-hero-sub-tight" : "pop-hero-sub"}>
              {hero?.sub ??
                "You have researched enough. POP is a working process with our team that takes you from suppliers and catalogs to a purchase order built around the capital you actually have."}
            </p>

            {form ? (
              <div className="pop-hero-form" id="get-started">
                {form}
              </div>
            ) : (
              <div className="pop-hero-actions">
                <a
                  className={`pop-cta pop-cta-lg ${heroSheen.className}`}
                  href={carry(primary.href)}
                  ref={heroSheen.ref}
                >
                  <span className="pop-cta-row">
                    {showDollar ? dollarLabel(primary.label) : primary.label}
                    <ArrowRight
                      size={19}
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  </span>
                  <small>{showDollar ? (hero ? dollarSubShort : dollarSub) : primary.sub}</small>
                </a>
                {(!cta || cta.secondaryLabel) && (
                  <a
                    className="pop-cta-ghost"
                    href={cta ? BOOK_URL : "#how-it-works"}
                  >
                    {cta ? cta.secondaryLabel : "See how it works"}
                  </a>
                )}
              </div>
            )}

            {/* On the ad hero the proof comes before the small print, so it makes the first screen. */}
            {hero && <HeroScan />}

            {dollarNote}

            {trustpilot && <TrustpilotBadge {...trustpilot} />}

            {!hidden.has("heroFine") && (
              <p className="pop-hero-fine">
                Not a course. Not a get-rich-quick program. One purchase order.
              </p>
            )}

            <motion.div
              className="pop-hero-art"
              style={
                reduceMotion ? undefined : { y: artY, opacity: artOpacity }
              }
            >
              <figure className="pop-frame glow-edge">
                <div className="pop-frame-bar">
                  <span className="pop-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="pop-frame-title">
                    Apex · Purchase Orders · Projection
                  </span>
                </div>
                <img
                  src={SHOT.purchaseOrders}
                  alt="The Apex Purchase Orders screen, showing a projection of total revenue, expenses and profit above a list of open supplier orders with cost of goods and unit counts."
                  width={1621}
                  height={936}
                  fetchPriority="high"
                />
              </figure>
              <p className="pop-hero-caption">
                The Apex Purchase Order Builder. Figures shown are example data
                from the product, not a forecast of results.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------- denial */}
        {!hidden.has("denial") && (
          <section
            className="pop-denial pop-section-tight"
            aria-label="What Apex POP is not"
          >
            <div className="pop-shell">
              <div className="pop-denial-grid">
                {DENIALS.map(([title, body]) => (
                  <div className="pop-denial-cell" key={title}>
                    <span className="pop-denial-x" aria-hidden="true">
                      ✕
                    </span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- problem */}
        {!hidden.has("problem") && (
          <section className="pop-section pop-problem">
            <div className="pop-shell pop-problem-grid">
              <div className="pop-problem-copy">
                <p className="pop-label">The actual problem</p>
                <h2>
                  Too many courses.
                  <br />
                  <span className="pop-blue">Not enough purchase orders.</span>
                </h2>
                <p className="pop-lede">
                  You have watched the modules. You have saved the threads,
                  joined the group, and bookmarked the supplier list. On paper
                  you understand Amazon wholesale better than plenty of people
                  who are currently selling on it.
                </p>
                <p className="pop-lede">
                  <strong>What you do not have is an order.</strong> Not because
                  the information was wrong, but because none of it ever made
                  you sit down with one supplier catalog, one number you are
                  willing to commit, and build the thing that turns money into
                  inventory.
                </p>
                <p className="pop-lede">
                  Research has no finish line, so it is easy to stay in. A
                  purchase order has one. POP exists to get you to it.
                </p>
              </div>

              <aside className="pop-loop" aria-label="The research loop">
                <div className="pop-loop-head">
                  <strong>The loop</strong>
                  <span className="pop-label">Month 7</span>
                </div>
                <ol>
                  <li>
                    <b>01</b> Watch another module on sourcing
                  </li>
                  <li>
                    <b>02</b> Add three suppliers to a spreadsheet
                  </li>
                  <li>
                    <b>03</b> Scroll a catalog, check a few ASINs by hand
                  </li>
                  <li>
                    <b>04</b> Decide you need to learn more first
                  </li>
                  <li>
                    <b>05</b> Buy a course about the part you skipped
                  </li>
                </ol>
                <p className="pop-loop-end">
                  <span aria-hidden="true">→</span> Orders placed: zero
                </p>
              </aside>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ flow */}
        {!hidden.has("flow") && (
          <section className="pop-section pop-flow mesh-bg" id="how-it-works">
            <div className="pop-shell">
              <div className="pop-flow-head">
                <p className="pop-label">How POP works</p>
                <h2>
                  Six steps, in order,
                  <br />
                  ending in a <mark>purchase order.</mark>
                </h2>
                <p className="pop-lede">
                  Each one produces something the next one needs. You are never
                  researching in general; you are always working on this order.
                </p>
              </div>

              <ol className="pop-rail" aria-hidden="true">
                {STEPS.map((step, i) => (
                  <li
                    key={step.rail}
                    className={
                      "pop-rail-node" +
                      (i === STEPS.length - 1
                        ? " is-last"
                        : "key" in step && step.key
                          ? " is-key"
                          : "")
                    }
                  >
                    <i>{i + 1}</i>
                    <span>{step.rail}</span>
                  </li>
                ))}
              </ol>

              <ol className="pop-steps">
                {STEPS.map(
                  ({ n, Icon, title, body, outcome, tool, ...rest }) => (
                    <motion.li
                      key={n}
                      className={
                        "pop-step" +
                        ("key" in rest && rest.key ? " is-key glow-edge" : "")
                      }
                      initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                      whileInView={
                        reduceMotion ? undefined : { opacity: 1, y: 0 }
                      }
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="pop-step-ico" aria-hidden="true">
                        <Icon size={21} strokeWidth={2} />
                      </span>
                      <div className="pop-step-body">
                        <p className="pop-label">{n}</p>
                        <h3>{title}</h3>
                        <p>{body}</p>
                      </div>
                      <div className="pop-step-aside">
                        <p className="pop-label">You end up with</p>
                        <p>{outcome}</p>
                        <span className="pop-step-tool">{tool}</span>
                      </div>
                    </motion.li>
                  ),
                )}
              </ol>
            </div>
          </section>
        )}

        {/* -------------------------------------------------------- software */}
        {!hidden.has("software") && (
          <section className="pop-section">
            <div className="pop-shell">
              <div className="pop-soft-head">
                <p className="pop-label">
                  {software?.label ?? "The software you do it in"}
                </p>
                <h2>
                  {software?.title ?? (
                    <>
                      The work happens in the product,
                      <br />
                      <span className="pop-blue">not in a workbook.</span>
                    </>
                  )}
                </h2>
                <p className="pop-lede">
                  {software?.lede ??
                    "These are the screens the six steps are worked in. Same tools we use, same ones you keep after the order is built."}
                </p>
              </div>

              {showcase && <SupplierShowcase video={showcase.video} />}

              <div className="pop-shots">
                {!showcase && (
                  <article className="pop-shot">
                    <div className="pop-shot-copy">
                      <p className="pop-label">Step 01 · Vendors</p>
                      <h3>Your suppliers in one table.</h3>
                      <p>
                        Accounts, contacts, lead times, payment method and
                        catalog status for every supplier you deal with, instead
                        of a spreadsheet that stopped being accurate in March.
                      </p>
                      <ul className="pop-shot-list">
                        <li>
                          <span aria-hidden="true">→</span> Account numbers,
                          logins and contacts held per supplier
                        </li>
                        <li>
                          <span aria-hidden="true">→</span> Lead times and terms
                          recorded as you learn them
                        </li>
                        <li>
                          <span aria-hidden="true">→</span> Spend by vendor once
                          orders start landing
                        </li>
                      </ul>
                    </div>
                    <figure className="pop-frame glow-edge">
                      <div className="pop-frame-bar">
                        <span className="pop-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="pop-frame-title">Apex · Vendors</span>
                      </div>
                      <img
                        src={SHOT.vendors}
                        alt="The Apex Vendors screen listing suppliers with their websites, account details, lead times and payment methods, alongside a vendor spend breakdown."
                        loading="lazy"
                      />
                    </figure>
                  </article>
                )}

                <article className="pop-shot">
                  <div className="pop-shot-copy">
                    <p className="pop-label">Step 02 · UPC Scanner</p>
                    <h3>A whole price list, costed line by line.</h3>
                    <p>
                      Load the catalog and read landed cost against sold price
                      with Amazon&rsquo;s fees already taken out, so the
                      products that do not work rule themselves out before you
                      spend an evening on them.
                    </p>
                    <ul className="pop-shot-list">
                      <li>
                        <span aria-hidden="true">→</span> Landed cost, current
                        and average sold price
                      </li>
                      <li>
                        <span aria-hidden="true">→</span> FBA, referral,
                        shipping and inbound fees per line
                      </li>
                      <li>
                        <span aria-hidden="true">→</span> Profit, ROI and margin
                        calculated on each row
                      </li>
                    </ul>
                  </div>
                  <figure className="pop-frame glow-edge">
                    <div className="pop-frame-bar">
                      <span className="pop-dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="pop-frame-title">
                        Apex · UPC Scanner
                      </span>
                    </div>
                    <img
                      src={SHOT.upcScanner}
                      alt="The Apex UPC Scanner showing a supplier catalog as rows of products with landed cost, sold price, profit, ROI, margin and Amazon fees on each line."
                      loading="lazy"
                    />
                  </figure>
                </article>

                {showcase ? (
                  <AllInOne />
                ) : (
                <article className="pop-shot">
                  <div className="pop-shot-copy">
                    <p className="pop-label">
                      Step 06 · Purchase Order Builder
                    </p>
                    <h3>The order, projected before it is placed.</h3>
                    <p>
                      Put the units and costs in and the builder returns the
                      order&rsquo;s arithmetic: revenue, expenses, profit,
                      margin and ROI at the quantities you chose, while you can
                      still change them.
                    </p>
                    <ul className="pop-shot-list">
                      <li>
                        <span aria-hidden="true">→</span> Units purchased and
                        cost of goods per supplier
                      </li>
                      <li>
                        <span aria-hidden="true">→</span> Amazon fees, shipping
                        and prep carried into the total
                      </li>
                      <li>
                        <span aria-hidden="true">→</span> One projection for the
                        order as a whole
                      </li>
                    </ul>
                  </div>
                  <figure className="pop-frame glow-edge">
                    <div className="pop-frame-bar">
                      <span className="pop-dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="pop-frame-title">
                        Apex · Purchase Orders
                      </span>
                    </div>
                    <img
                      src={SHOT.purchaseOrders}
                      alt="The Apex Purchase Orders screen with a projection panel showing total revenue, expenses and profit for the orders below it."
                      loading="lazy"
                    />
                  </figure>
                </article>
                )}
              </div>

              <p className="pop-fineprint">
                Screenshots show the Apex application with example data. Figures
                are calculated from the costs and prices entered and are
                projections, not statements of results.
              </p>
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- outcome */}
        {!hidden.has("outcome") && (
          <section className="pop-section pop-outcome">
            <div className="pop-shell pop-outcome-grid">
              <div>
                <p className="pop-label">What you leave with</p>
                <h2>
                  Four things you did not
                  <br />
                  have <span className="pop-blue">last month.</span>
                </h2>
                <p className="pop-lede">
                  Not notes. Not a framework. The four artefacts that stand
                  between researching wholesale and buying inventory.
                </p>
              </div>
              <ul className="pop-deliver">
                {DELIVERABLES.map(({ Icon, title, body }) => (
                  <li key={title}>
                    <span className="pop-deliver-ico" aria-hidden="true">
                      <Icon size={19} strokeWidth={2} />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>{body}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- fit */}
        {!hidden.has("fit") && (
          <section className="pop-section pop-section-tight">
            <div className="pop-shell">
              <p className="pop-label">Fit</p>
              <h2>Worth being honest about.</h2>
              <div className="pop-fit-grid">
                <div className="pop-fit is-yes glow-edge">
                  <h3>POP is for you if</h3>
                  <ul>
                    <li>
                      <span aria-hidden="true">✓</span> You have done the
                      learning and still have not placed an order.
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span> You are selling already
                      and your next order is guesswork rather than process.
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span> You have capital you are
                      ready to deploy deliberately.
                    </li>
                    <li>
                      <span aria-hidden="true">✓</span> You want someone to
                      check your numbers before the money moves.
                    </li>
                  </ul>
                </div>
                <div className="pop-fit is-no">
                  <h3>POP is not for you if</h3>
                  <ul>
                    <li>
                      <span aria-hidden="true">✕</span> You are looking for a
                      course to work through at your own pace.
                    </li>
                    <li>
                      <span aria-hidden="true">✕</span> You want passive income
                      without buying inventory.
                    </li>
                    <li>
                      <span aria-hidden="true">✕</span> You want a promise about
                      what an order will return.
                    </li>
                    <li>
                      <span aria-hidden="true">✕</span> You are not in a
                      position to spend money on stock yet.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- faq */}
        {!hidden.has("faq") && (
          <section className="pop-section pop-section-tight pop-faq">
            <div className="pop-shell pop-faq-grid">
              <div>
                <p className="pop-label">Questions</p>
                <h2>Before you book.</h2>
              </div>
              <div>
                {FAQS.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <i aria-hidden="true">+</i>
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ----------------------------------------------------------- close */}
        {!hidden.has("close") && (
          <section className="pop-section pop-close mesh-bg">
            <div className="pop-shell pop-close-in">
              <p className="pop-label">Your next step</p>
              <h2>
                Stop researching.
                <br />
                Start <mark>building the order.</mark>
              </h2>
              <p className="pop-lede" style={{ marginInline: "auto" }}>
                {showDollar
                  ? `Start your $${DOLLAR_WEEK.price} week and build the order in the software. Bring what you have, even if that is nothing but the intention to buy, and start at step one.`
                  : cta
                  ? "Open your free Apex account and build the order in the software. Bring what you have, even if that is nothing but the intention to buy, and start at step one."
                  : "Book a working session with the Apex team. Bring what you have, even if that is nothing but the intention to buy, and we will start at step one."}
              </p>
              <div className="pop-hero-actions">
                <a
                  className={`pop-cta pop-cta-lg ${closeSheen.className}`}
                  href={carry(primaryHref)}
                  ref={closeSheen.ref}
                >
                  <span className="pop-cta-row">
                    {showDollar ? dollarLabel(primary.label) : primary.label}
                    <ArrowRight
                      size={19}
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  </span>
                  <small>{showDollar ? dollarSub : primary.sub}</small>
                </a>
              </div>
              {dollarNote}
              <p className="pop-close-fine" hidden={showDollar}>
                {cta
                  ? "Free account. Nothing to buy to get started."
                  : "A conversation about your order. No obligation to buy anything on the call."}
              </p>
            </div>
          </section>
        )}
        {sited && !hidden.has("disclaimer") && (
          <section className="pop-section-tight" aria-label="Disclaimer">
            <div className="pop-shell">
              <p className="pop-fineprint">
                Apex POP is a working process and software, not a course, an
                investment product, or a guarantee of results. Supplier
                acceptance, stock, pricing and terms vary and are decided by
                each supplier. Amazon decides selling approvals. Projections
                shown in the Apex Purchase Order Builder are calculated from
                figures you enter and are not a forecast of sales or profit.
                Amazon is a trademark of Amazon.com, Inc. or its affiliates.
              </p>
            </div>
          </section>
        )}
      </main>

      {!sited && (
        <footer className="pop-footer">
          <div className="pop-shell">
            <div className="pop-footer-top">
              <a className="pop-brand" href={ORIGIN}>
                <img src="/assets/bull.png" alt="" width={54} height={42} />
                <span className="pop-brand-name">
                  APEX
                  <small>APPLICATIONS</small>
                </span>
              </a>
              <nav className="pop-footer-links" aria-label="Footer">
                <a href={`${ORIGIN}/how-it-works`}>How it works</a>
                <a href={`${ORIGIN}/contact-us`}>Contact</a>
                <a href={`${ORIGIN}/privacy`}>Privacy</a>
                <a href={`${ORIGIN}/terms`}>Terms</a>
              </nav>
            </div>
            <div className="pop-footer-legal">
              <span>© {new Date().getFullYear()} Apex Applications</span>
              <span>Apex POP · Purchase Order Program</span>
            </div>
            <p className="pop-fineprint">
              Apex POP is a working process and software, not a course, an
              investment product, or a guarantee of results. Supplier
              acceptance, stock, pricing and terms vary and are decided by each
              supplier. Amazon decides selling approvals. Projections shown in
              the Apex Purchase Order Builder are calculated from figures you
              enter and are not a forecast of sales or profit. Amazon is a
              trademark of Amazon.com, Inc. or its affiliates. This site is not
              part of or endorsed by Facebook. FACEBOOK is a trademark of Meta
              Platforms, Inc.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
