"use client";

/**
 * Purchase Order Program — the landing page for the four-part offer.
 *
 * One job: get a reader to book a working session that ends in a purchase
 * order. Nothing else is sold here — no plan, no price, no bundle. What is
 * offered is four things, in the order they are needed: the first suppliers,
 * the selling approvals, the research, and the first order itself.
 *
 * It is a sibling of /apex-pop and borrows that page's surface wholesale —
 * same stylesheet, same classes, same mesh background and CTA sheen — so the
 * two read as one company. Where /apex-pop is written for someone who has
 * done the research and stalled, this page is written for someone who has
 * none of the four things yet and wants them done with, not taught.
 *
 * Two constraints carry over and are load-bearing. It must not read as a
 * course: the denial is made near the top. It must not promise outcomes:
 * suppliers decide who they open accounts for, Amazon decides selling
 * approvals, and the builder's projections are arithmetic on inputs the
 * seller supplies. Those disclaimers are in the FAQ and the footer.
 *
 * The section headed "Always be loading your database" is the operating
 * philosophy the product is built to enforce, stated plainly: add vendors,
 * scan and rescan catalogs, turn what clears into purchase orders, let the
 * repricer win the Buy Box, let the restock planner say what to buy next.
 * The four deliverables are the first turn of that loop.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  Boxes,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Database,
  RefreshCw,
  ScanBarcode,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import "./apex-surface.css";
import "./apex-pop.css";
import TrustpilotBadge, { TRUSTPILOT } from "./TrustpilotBadge";

const ORIGIN = "https://www.apexapplications.io";

/**
 * The booking link the whole page points at. Same Calendly the rest of the
 * site books into, with utm_term set so a booking from this page is
 * identifiable in the calendar without asking the caller.
 */
const BOOK_URL =
  "https://calendly.com/apexapplications-info/new-meeting?utm_term=purchase-order-program";

/** Real Apex screens, served from the same asset paths the product pages use. */
const SHOT = {
  purchaseOrders:
    "/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png",
  upcScanner:
    "/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png",
  database:
    "/__l5e/assets-v1/1a86b853-f5c6-4578-a0d4-2ccbe7398535/market-intelligence-database.png",
  vendors: "/images/vendors-with-products.webp",
} as const;

/** Lights the CTA sheen once, the moment the element is properly on screen. */
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
 * The four things the program delivers, in the order they are worked.
 * Each one produces what the next one needs.
 */
const PILLARS = [
  {
    n: "Part 01",
    rail: "Suppliers",
    Icon: Building2,
    title: "Your first suppliers: the ones who will actually sell to you.",
    body:
      "We start with the distributors we already work with and the ones that fit your category and budget. Account applications go in, catalogs get requested, and every requirement, minimum and payment term is written down in Vendors instead of scattered across email.",
    outcome: "Supplier accounts opening, with catalogs on the way.",
    tool: "Vendors · Distributor Vault",
  },
  {
    n: "Part 02",
    rail: "Ungating",
    Icon: ShieldCheck,
    title: "Ungating: know what you are allowed to sell before you buy it.",
    body:
      "The Ungate Checker asks Amazon, brand by brand, whether your account can list what those catalogs hold. We sort the answers into sell now, needs approval and gated, and we help you put the approval applications in with the right invoices behind them.",
    outcome: "A list of brands you can list today, and applications in for the rest.",
    tool: "Ungate Checker",
    key: true,
  },
  {
    n: "Part 03",
    rail: "Research",
    Icon: ScanBarcode,
    title: "Research: whole catalogs costed line by line, not ten products you remember.",
    body:
      "Every supplier price list goes through the UPC Scanner: landed cost against sold price, Amazon fees, shipping, margin, ROI and a monthly sales estimate on each row. What clears goes into your database. What does not, rules itself out before you spend an evening on it.",
    outcome: "A database of products that work, not a spreadsheet of maybes.",
    tool: "UPC Scanner · Databases",
  },
  {
    n: "Part 04",
    rail: "First order",
    Icon: ClipboardCheck,
    title: "Your first purchase order: built together, projected before it is sent.",
    body:
      "We size the order to the capital you have decided to put in, then build it in the Purchase Order Builder: quantities, cost of goods, fees, shipping and prep, and the projection that comes back. You send it to the supplier knowing what the order looks like on paper.",
    outcome: "A purchase order sent to a supplier, and a plan for the next one.",
    tool: "Purchase Order Builder",
    key: true,
  },
] as const;

const DENIALS = [
  [
    "Not another course",
    "Nothing to watch and nothing to finish. We do the four things with you, in the software, on your account.",
  ],
  [
    "Not get-rich-quick",
    "Buying inventory is a real business decision with real downside. We help you make it carefully, in the right order.",
  ],
  [
    "Not a guarantee",
    "Suppliers choose who they open accounts for and Amazon decides selling approvals. We prepare you for both and we tell you the answer straight.",
  ],
] as const;

/** The operating loop the four parts are the first turn of. */
const LOOP = [
  ["Add vendors", "New suppliers, all the time. The database only grows from the top."],
  ["Scan and rescan", "Every catalog, every few weeks. A rescan asks what has become profitable since last time."],
  ["Turn it into orders", "What clears becomes a purchase order, sized to the money you have."],
  ["Win the Buy Box", "The repricer holds the price that wins, so the stock you bought actually sells."],
  ["Restock what moves", "The restock planner says what to order next and how many, from your own sales."],
] as const;

const DELIVERABLES = [
  {
    Icon: Boxes,
    title: "Supplier accounts",
    body: "Applications in, terms and minimums recorded, catalogs requested from suppliers that fit you.",
  },
  {
    Icon: ShieldCheck,
    title: "Your approvals map",
    body: "Brand by brand: what you can list now, what needs approval, and what to skip.",
  },
  {
    Icon: Database,
    title: "A loaded database",
    body: "Catalogs scanned against real Amazon fees and narrowed to the lines that survive the maths.",
  },
  {
    Icon: ClipboardList,
    title: "A purchase order",
    body: "Units, costs and a full projection, built in Apex and sent to the supplier.",
  },
] as const;

const FAQS: readonly (readonly [string, string])[] = [
  [
    "Is the Purchase Order Program a course?",
    "No. Apex University exists inside the software if you want to look something up, but the program is not something you study. It is a working process with our team: suppliers, approvals, research and the order, done on your account, in the software you keep afterwards.",
  ],
  [
    "Do you guarantee supplier accounts, selling approvals or profit?",
    "No. Every supplier sets its own requirements and decides who it opens an account for. Amazon decides selling approvals. The figures in the Purchase Order Builder are arithmetic on the costs and prices entered, so they are projections, not a promise of what an order will return.",
  ],
  [
    "What if the brands I want are gated?",
    "That is exactly why ungating comes before research. The Ungate Checker tells us which brands your account can list now and which need approval, and we help you apply for the ones worth applying for. You buy against what you are allowed to sell, not the other way round.",
  ],
  [
    "I have never placed an order. Is this too early for me?",
    "No, that is who it is for. The program starts before your first order: the suppliers, then the approvals, then the catalogs, then the number you are comfortable committing. If you are already selling, the same four parts build your next order and load your database properly.",
  ],
  [
    "Do I need capital ready?",
    "You need to be at the point where buying inventory is the next real step. We size the order to what you decide to put in, and we would rather you keep money in reserve than spend all of it on the first order. How much you commit is your decision.",
  ],
  [
    "Does this need the Apex software?",
    "Yes. The work happens in Vendors, the Ungate Checker, the UPC Scanner, Databases and the Purchase Order Builder, and you keep all of it after the order is built. We go through what your setup needs on the call.",
  ],
];

export default function PurchaseOrderProgram() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroSheen = useSheen<HTMLAnchorElement>();
  const closeSheen = useSheen<HTMLAnchorElement>();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start 0.85", "end 0.35"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], [26, 0]);
  const artOpacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);

  return (
    <div className="apex-surface pop-page">
      <header className="pop-header">
        <div className="pop-header-in">
          <a className="pop-brand" href={ORIGIN} aria-label="Apex Applications home">
            <img src="/assets/bull.png" alt="" width={54} height={42} />
            <span className="pop-brand-name">
              APEX
              <small>APPLICATIONS</small>
            </span>
          </a>
          <div className="pop-header-right">
            <span className="pop-header-note">Purchase Order Program</span>
            <a className="pop-cta pop-cta-sm" href={BOOK_URL}>
              <span className="pop-cta-row">
                Start my first order
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------------ hero */}
        <section className="pop-hero mesh-bg" ref={heroRef}>
          <div className="pop-shell pop-hero-in">
            <p className="pop-label pop-eyebrow">Apex · Purchase Order Program</p>

            <h1>
              Your first suppliers, your approvals, your research and your first{" "}
              <mark>purchase order.</mark>
            </h1>

            <p className="pop-hero-sub">
              A working program with the Apex team. We open the supplier doors, check
              what Amazon will let you sell, run the catalogs with you and build the
              order together, in the software you keep afterwards.
            </p>

            <div className="pop-hero-actions">
              <a
                className={`pop-cta pop-cta-lg ${heroSheen.className}`}
                href={BOOK_URL}
                ref={heroSheen.ref}
              >
                <span className="pop-cta-row">
                  Start my first order
                  <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
                </span>
                <small>Book a working session with the Apex team</small>
              </a>
              <a className="pop-cta-ghost" href="#what-you-get">
                See what is included
              </a>
            </div>

            <TrustpilotBadge {...TRUSTPILOT} />

            <p className="pop-hero-fine">
              Not a course. Four things done with you, ending in one purchase order.
            </p>

            <motion.div
              className="pop-hero-art"
              style={reduceMotion ? undefined : { y: artY, opacity: artOpacity }}
            >
              <figure className="pop-frame glow-edge">
                <div className="pop-frame-bar">
                  <span className="pop-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="pop-frame-title">Apex · Purchase Orders · Projection</span>
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
                The Apex Purchase Order Builder. Figures shown are example data from the
                product, not a forecast of results.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------- denial */}
        <section className="pop-denial pop-section-tight" aria-label="What the program is not">
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

        {/* --------------------------------------------------------- problem */}
        <section className="pop-section pop-problem">
          <div className="pop-shell pop-problem-grid">
            <div className="pop-problem-copy">
              <p className="pop-label">Why the order never happens</p>
              <h2>
                Four doors, in the wrong order,
                <br />
                <span className="pop-blue">and none of them open.</span>
              </h2>
              <p className="pop-lede">
                Most people who want to sell wholesale on Amazon get stuck in the same
                place. No supplier will answer. The brands they like turn out to be
                gated. The research is a spreadsheet of maybes. And the first order
                never gets built because nothing before it was finished.
              </p>
              <p className="pop-lede">
                <strong>The order is the last of four things, and it needs the other
                three first.</strong> Suppliers who will sell to you. Approval for what
                they sell. Numbers you trust. Then, and only then, a purchase order.
              </p>
              <p className="pop-lede">
                That is the program. We do the four things with you, in that order, on
                your account.
              </p>
            </div>

            <aside className="pop-loop" aria-label="The usual order of events">
              <div className="pop-loop-head">
                <strong>How it usually goes</strong>
                <span className="pop-label">Month 5</span>
              </div>
              <ol>
                <li>
                  <b>01</b> Email twelve suppliers, hear back from one
                </li>
                <li>
                  <b>02</b> Find a product, discover the brand is gated
                </li>
                <li>
                  <b>03</b> Check a few ASINs by hand, lose the tab
                </li>
                <li>
                  <b>04</b> Decide to learn more before buying anything
                </li>
                <li>
                  <b>05</b> Start again with a different supplier
                </li>
              </ol>
              <p className="pop-loop-end">
                <span aria-hidden="true">→</span> Orders placed: zero
              </p>
            </aside>
          </div>
        </section>

        {/* ---------------------------------------------------------- pillars */}
        <section className="pop-section pop-flow mesh-bg" id="what-you-get">
          <div className="pop-shell">
            <div className="pop-flow-head">
              <p className="pop-label">What you get</p>
              <h2>
                Four things, in order,
                <br />
                ending in a <mark>purchase order.</mark>
              </h2>
              <p className="pop-lede">
                Each one produces what the next one needs. Nothing here is general
                research. Everything is about this order.
              </p>
            </div>

            <ol className="pop-rail" aria-hidden="true">
              {PILLARS.map((part, i) => (
                <li
                  key={part.rail}
                  className={
                    "pop-rail-node" +
                    (i === PILLARS.length - 1
                      ? " is-last"
                      : "key" in part && part.key
                        ? " is-key"
                        : "")
                  }
                >
                  <i>{i + 1}</i>
                  <span>{part.rail}</span>
                </li>
              ))}
            </ol>

            <ol className="pop-steps">
              {PILLARS.map(({ n, Icon, title, body, outcome, tool, ...rest }) => (
                <motion.li
                  key={n}
                  className={"pop-step" + ("key" in rest && rest.key ? " is-key glow-edge" : "")}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
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
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------ philosophy */}
        <section className="pop-section pop-outcome">
          <div className="pop-shell pop-outcome-grid">
            <div>
              <p className="pop-label">The idea behind it</p>
              <h2>
                Always be loading
                <br />
                <span className="pop-blue">your database.</span>
              </h2>
              <p className="pop-lede">
                An Amazon wholesale business is not a list of tools. It is one loop,
                run over and over. The purpose of a scan is not the scan. It is loading
                the database. The four parts of the program are the first turn of that
                loop, and the software is built to keep it turning.
              </p>
            </div>
            <ul className="pop-deliver">
              {LOOP.map(([title, body], i) => (
                <li key={title}>
                  <span className="pop-deliver-ico" aria-hidden="true">
                    {i === 3 ? (
                      <TrendingUp size={19} strokeWidth={2} />
                    ) : i === 4 ? (
                      <RefreshCw size={19} strokeWidth={2} />
                    ) : (
                      <b style={{ fontStyle: "normal", fontSize: 13 }}>{i + 1}</b>
                    )}
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

        {/* -------------------------------------------------------- software */}
        <section className="pop-section">
          <div className="pop-shell">
            <div className="pop-soft-head">
              <p className="pop-label">The software you do it in</p>
              <h2>
                The work happens in the product,
                <br />
                <span className="pop-blue">not in a workbook.</span>
              </h2>
              <p className="pop-lede">
                These are the screens the four parts are worked in. Same tools we use,
                same ones you keep after the order is built.
              </p>
            </div>

            <div className="pop-shots">
              <article className="pop-shot">
                <div className="pop-shot-copy">
                  <p className="pop-label">Part 01 · Vendors</p>
                  <h3>Your suppliers in one table.</h3>
                  <p>
                    Accounts, contacts, lead times, payment method and catalog status
                    for every supplier you deal with, and the distributors we bring to
                    the table alongside your own.
                  </p>
                  <ul className="pop-shot-list">
                    <li>
                      <span aria-hidden="true">→</span> Account numbers, logins and
                      contacts held per supplier
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> Lead times, minimums and terms
                      recorded as you learn them
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> Spend by vendor once orders
                      start landing
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

              <article className="pop-shot">
                <div className="pop-shot-copy">
                  <p className="pop-label">Part 02 and 03 · Databases</p>
                  <h3>What you can sell, and what it is worth.</h3>
                  <p>
                    Every product that clears the scanner lands here with its landed
                    cost, fees, profit and sales estimate, and the Ungate Checker marks
                    each one as ungated, needing approval or gated for your account.
                  </p>
                  <ul className="pop-shot-list">
                    <li>
                      <span aria-hidden="true">→</span> Ungated and Gated views, one
                      click apart
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> Profit, ROI and monthly sales
                      estimate on each row
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> Supply chain, stock and Buy Box
                      once you are selling
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
                    <span className="pop-frame-title">Apex · Databases</span>
                  </div>
                  <img
                    src={SHOT.database}
                    alt="The Apex Databases screen listing housed products with cost, sold price, profit, ROI and a market intelligence breakdown."
                    loading="lazy"
                  />
                </figure>
              </article>

              <article className="pop-shot">
                <div className="pop-shot-copy">
                  <p className="pop-label">Part 03 · UPC Scanner</p>
                  <h3>A whole price list, costed line by line.</h3>
                  <p>
                    Load the catalog and read landed cost against sold price with
                    Amazon&rsquo;s fees already taken out, so the products that do not
                    work rule themselves out before you spend an evening on them.
                  </p>
                  <ul className="pop-shot-list">
                    <li>
                      <span aria-hidden="true">→</span> Landed cost, current and average
                      sold price
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> FBA, referral, shipping and
                      inbound fees per line
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
                    <span className="pop-frame-title">Apex · UPC Scanner</span>
                  </div>
                  <img
                    src={SHOT.upcScanner}
                    alt="The Apex UPC Scanner showing a supplier catalog as rows of products with landed cost, sold price, profit, ROI, margin and Amazon fees on each line."
                    loading="lazy"
                  />
                </figure>
              </article>

              <article className="pop-shot">
                <div className="pop-shot-copy">
                  <p className="pop-label">Part 04 · Purchase Order Builder</p>
                  <h3>The order, projected before it is placed.</h3>
                  <p>
                    Put the units and costs in and the builder returns the order&rsquo;s
                    arithmetic: revenue, expenses, profit, margin and ROI at the
                    quantities you chose, while you can still change them.
                  </p>
                  <ul className="pop-shot-list">
                    <li>
                      <span aria-hidden="true">→</span> Units purchased and cost of goods
                      per supplier
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> Amazon fees, shipping and prep
                      carried into the total
                    </li>
                    <li>
                      <span aria-hidden="true">→</span> One projection for the order as
                      a whole
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
                    <span className="pop-frame-title">Apex · Purchase Orders</span>
                  </div>
                  <img
                    src={SHOT.purchaseOrders}
                    alt="The Apex Purchase Orders screen with a projection panel showing total revenue, expenses and profit for the orders below it."
                    loading="lazy"
                  />
                </figure>
              </article>
            </div>

            <p className="pop-fineprint">
              Screenshots show the Apex application with example data. Figures are
              calculated from the costs and prices entered and are projections, not
              statements of results.
            </p>
          </div>
        </section>

        {/* --------------------------------------------------------- outcome */}
        <section className="pop-section pop-outcome">
          <div className="pop-shell pop-outcome-grid">
            <div>
              <p className="pop-label">What you leave with</p>
              <h2>
                Four things you did not
                <br />
                have <span className="pop-blue">before.</span>
              </h2>
              <p className="pop-lede">
                Not notes. Not a framework. The four things that stand between wanting
                to sell wholesale and buying inventory, done.
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

        {/* ------------------------------------------------------------- fit */}
        <section className="pop-section pop-section-tight">
          <div className="pop-shell">
            <p className="pop-label">Fit</p>
            <h2>Worth being honest about.</h2>
            <div className="pop-fit-grid">
              <div className="pop-fit is-yes glow-edge">
                <h3>The program is for you if</h3>
                <ul>
                  <li>
                    <span aria-hidden="true">✓</span> You want to sell wholesale on
                    Amazon and have no suppliers yet.
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> You keep finding products and then
                    finding out you cannot list them.
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> You have capital you are ready to
                    deploy deliberately.
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span> You want someone beside you for the
                    first order, not a video about it.
                  </li>
                </ul>
              </div>
              <div className="pop-fit is-no">
                <h3>The program is not for you if</h3>
                <ul>
                  <li>
                    <span aria-hidden="true">✕</span> You are looking for a course to
                    work through at your own pace.
                  </li>
                  <li>
                    <span aria-hidden="true">✕</span> You want passive income without
                    buying inventory.
                  </li>
                  <li>
                    <span aria-hidden="true">✕</span> You want a promise about what an
                    order will return.
                  </li>
                  <li>
                    <span aria-hidden="true">✕</span> You are not in a position to spend
                    money on stock yet.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- faq */}
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

        {/* ----------------------------------------------------------- close */}
        <section className="pop-section pop-close mesh-bg">
          <div className="pop-shell pop-close-in">
            <p className="pop-label">Your next step</p>
            <h2>
              Suppliers. Approvals. Research.
              <br />
              Then <mark>your first order.</mark>
            </h2>
            <p className="pop-lede" style={{ marginInline: "auto" }}>
              Book a working session with the Apex team. Bring what you have, even if
              that is nothing but the intention to buy, and we start at the suppliers.
            </p>
            <div className="pop-hero-actions">
              <a
                className={`pop-cta pop-cta-lg ${closeSheen.className}`}
                href={BOOK_URL}
                ref={closeSheen.ref}
              >
                <span className="pop-cta-row">
                  Start my first order
                  <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
                </span>
                <small>Book a working session with the Apex team</small>
              </a>
            </div>
            <p className="pop-close-fine">
              A conversation about your first order. No obligation to buy anything on
              the call.
            </p>
          </div>
        </section>
      </main>

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
            <span>Apex · Purchase Order Program</span>
          </div>
          <p className="pop-fineprint">
            The Purchase Order Program is a working process and software, not a course,
            an investment product, or a guarantee of results. Supplier acceptance,
            stock, pricing and terms vary and are decided by each supplier. Amazon
            decides selling approvals. Projections shown in the Apex Purchase Order
            Builder are calculated from figures you enter and are not a forecast of
            sales or profit. Amazon is a trademark of Amazon.com, Inc. or its
            affiliates. This site is not part of or endorsed by Facebook. FACEBOOK is a
            trademark of Meta Platforms, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
