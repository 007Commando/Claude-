"use client";

/**
 * The free-course landing page — Apex University, no card.
 *
 * Same template as /first-order-roadmap, different job: that page books a
 * call, this one opens an account. The offer is the course itself, so the
 * page ends at a free signup rather than a calendar.
 *
 * It lived at /zero-to-hero until that URL was given to the paid trial page.
 * The free course keeps its own home because it is the only thing pointing at
 * the plan-less signup path in Auth.tsx.
 *
 * Everything claimed here is read off the curriculum in the app
 * (features/university): five modules, nine videos, and one module — Getting
 * Started — that has no content yet and is named as coming rather than
 * counted. A landing page for a course has to describe the course that exists.
 */
import { motion, useReducedMotion, useScroll } from "motion/react";
import { Compass, Building2, Search, ShoppingCart } from "lucide-react";
import { useRef } from "react";

import "./apex-landing.css";

const origin = "https://www.apexapplications.io";

/** Where the free course begins: a signup that carries no plan. */
const ENROL_HREF = "/auth?mode=signup&plan=free";
// Returning students keep plan=free so /auth treats a plan-less account as a
// valid free account instead of an unfinished checkout.
const LOGIN_HREF = "/auth?mode=login&plan=free";

/**
 * The paid offer that follows the free course: the FBA Starter Bundle.
 *
 * The Keepa Playbook is the part of it this section shows, but the bundle is
 * what is actually sold, so the price and the extras below are the bundle's.
 * Price and destination are one constant each because they have to agree — a
 * button that advertises one number and charges another is the fastest way to
 * lose someone who already trusted us enough to click.
 */
const BUNDLE_PRICE = "$29";
const BUNDLE_HREF = "/fba-starter-bundle";

/** The rest of what the bundle carries, read off /fba-starter-bundle. */
const bundleExtras = [
  "Extended trial of Apex Black, Blue & Green",
  "3 vetted US wholesale suppliers",
  "Review Booster, free for life",
  "The Ungating SOP",
];

/**
 * The worksheets the playbook is made of. The figures are the ones printed on
 * the pages and they reconcile — 24 x $8.50 = $204, and $29.99 less $10.25 of
 * fees and $8.50 landed is $11.24, a 37% margin — because a worksheet that
 * teaches arithmetic cannot get its own arithmetic wrong.
 */
const worksheets = [
  {
    title: "The Wholesale Roadmap",
    blurb: "A simple 3-step path from finding products to getting them into Amazon's warehouses.",
    steps: [
      ["Find Products", "Identify in-demand brands and profitable opportunities."],
      ["Source from Suppliers", "Get approved and negotiate terms."],
      ["Send to Amazon", "Create a purchase order and ship to fulfilment centres."],
    ],
  },
  {
    title: "Your First Product Analysis",
    blurb: "Use a simple framework to evaluate if a product is worth buying.",
    rows: [
      ["Selling Price", "$29.99"],
      ["Total Fees", "$10.25"],
      ["Landed Cost", "$8.50"],
      ["Estimated Profit", "$11.24"],
      ["Profit Margin", "37%"],
    ],
    highlightRow: 3,
  },
  {
    title: "Find Real Suppliers",
    blurb: "How to get approved with legitimate distributors and start building relationships.",
    steps: [
      ["Identify Distributors", "Brand websites, trade shows and distributor directories."],
      ["Reach Out", "Send a professional inquiry and request an account."],
      ["Get Approved", "Provide your business information and start ordering."],
    ],
  },
  {
    title: "Build Your First Purchase Order",
    blurb: "Turn your research into a real order with a professional purchase order.",
    po: [
      ["Product A", "SKU-001", "24", "$8.50", "$204.00"],
      ["Product B", "SKU-002", "12", "$12.00", "$144.00"],
      ["Product C", "SKU-003", "24", "$6.75", "$162.00"],
    ],
    poTotal: "$510.00",
  },
];

const stepIcons = [Compass, Building2, Search, ShoppingCart];

const STEP_HEIGHT = 300;
const VIEWBOX_WIDTH = 400;

function buildRoadmapPath(count: number) {
  const points = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? 260 : 140,
    y: i * STEP_HEIGHT + STEP_HEIGHT / 2,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return { d, points };
}

/** The four populated modules, in the order the app lists them. */
const modules: [string, string, string, string][] = [
  [
    "The Game",
    "What the business actually is.",
    "A walkthrough of Apex, how wholesale works, and the checklist of what to have in place before you spend anything. Three videos.",
    "3 videos",
  ],
  [
    "Suppliers",
    "How to be taken seriously.",
    "Setting yourself up so distributors open an account for you, and where to look for suppliers worth contacting in the first place. Two videos.",
    "2 videos",
  ],
  [
    "Product Research",
    "Deciding what is worth buying.",
    "Running a supplier's catalogue through the UPC Scanner, and working backwards from a brand to the products behind it. Two videos.",
    "2 videos",
  ],
  [
    "Purchasing",
    "Placing and repeating the order.",
    "Turning research into a purchase order, and restocking what sells without starting the process over. Two videos.",
    "2 videos",
  ],
];

const faqs: [string, string][] = [
  [
    "Is the course really free?",
    "Yes. Create an account and Apex University opens. No card, no plan, nothing to cancel. The Review Booster and three UPC scans come with the same free account. The paid plans exist for the rest of the software, not for the course.",
  ],
  [
    "Do I need to be selling already?",
    "No. The first module starts before your first order: what the business is, what suppliers expect, and what to have ready. If you are already selling, start at Suppliers or Product Research instead.",
  ],
  [
    "How long is it?",
    "Nine videos across four modules, watchable in an evening. A fifth module, Getting Started, is being filmed and appears in your account when it lands.",
  ],
  [
    "Will this guarantee I get approved or make money?",
    "No, and nothing that says otherwise is telling you the truth. Each supplier sets its own account requirements, Amazon decides selling approvals, and what you earn depends on what you buy. The course teaches the process, not an outcome.",
  ],
  [
    "What happens after I watch it?",
    "You keep the account. If you want the software the course demonstrates, the scanner, purchase orders and analytics, that is a paid plan, and you can start one whenever it makes sense. Nothing expires if you don't.",
  ],
];

export default function FreeCourse() {
  const roadmapRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: roadmapRef,
    offset: ["start 0.35", "end 0.65"],
  });
  const { d: pathD, points } = buildRoadmapPath(modules.length);
  const roadmapHeight = modules.length * STEP_HEIGHT;

  return (
    <div className="apex-page">
      <header className="apex-header">
        <a href={origin} className="brand" aria-label="Apex Applications home">
          <img src="/assets/bull.png" alt="" />
          <span>
            APEX<small>APPLICATIONS</small>
          </span>
        </a>
        <a className="nav-cta" href={ENROL_HREF}>
          Start free <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">APEX UNIVERSITY · FREE COURSE</p>
          <h1>
            From zero to{" "}
            <br />
            <mark>Amazon hero.</mark>
          </h1>
          <p className="hero-sub">
            The wholesale business, taught in nine videos.{" "}
            <br />
            Free inside Apex University. No card, no plan.
          </p>
          <a className="hero-cta" href={ENROL_HREF}>
            Start the Free Course <span aria-hidden="true">→</span>
            <small>Create a free account, no card required</small>
          </a>
          {/* No hero illustration yet. The only one available is the book
              whose cover reads "First Order Roadmap" — a different offer by
              name — and a hero image naming the wrong product is worse than
              no hero image. Drop a course illustration in /public/assets and
              it goes here. */}
        </section>

        <section className="proof-strip" aria-label="What the course covers">
          <div>
            <strong>9 videos</strong>
            <span>Across four modules</span>
          </div>
          <div>
            <strong>Zero to first order</strong>
            <span>Suppliers, research, purchasing</span>
          </div>
          <div>
            <strong>Free account</strong>
            <span>No card. Nothing to cancel.</span>
          </div>
        </section>

        <section className="letter section">
          <div className="letter-margin">
            <span>FROM STEFANO</span>
            <div className="mini-rule" />
          </div>
          <div className="letter-body">
            <h2>
              Nobody starts
              <br />
              knowing how this works.
            </h2>
            <p>
              Wholesale is not complicated, but it is specific. There is an order to it, and most
              people meet the steps out of order, hunting products before they can open an
              account, or planning an order before they know whether they are allowed to sell it.
            </p>
            <div className="questions">
              <p>“Where do I even find real suppliers?”</p>
              <p>“How do I know what is worth buying?”</p>
              <p>“What do I do once the stock arrives?”</p>
            </div>
            <p>
              So we filmed the answers in the order you actually need them, and put them inside
              Apex where the tools they describe already live.{" "}
              <strong>It costs nothing to watch.</strong>
            </p>
            <p>
              Watch it, and you will know what the business asks of you before you spend anything
              on it. That seemed like the right thing to give away.
            </p>
            <div className="signature">
              Stefano<span>Founder, Apex Applications</span>
            </div>
          </div>
        </section>

        <section className="roadmap-section section">
          <div className="section-heading">
            <p className="eyebrow">THE CURRICULUM</p>
            <h2>
              Four modules.
              <br />
              <span className="blue">Zero to your first order.</span>
            </h2>
            <p>In the order you need them.</p>
          </div>

          <div className="roadmap" ref={roadmapRef} style={{ minHeight: roadmapHeight }}>
            <div className="roadmap-rail" aria-hidden="true">
              <motion.div
                className="roadmap-rail-fill"
                style={{ scaleY: reduceMotion ? 1 : scrollYProgress }}
              />
            </div>
            <svg
              className="roadmap-track"
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${roadmapHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={pathD} fill="none" stroke="var(--apex-line)" strokeWidth={3} strokeLinecap="round" />
              <motion.path
                d={pathD}
                fill="none"
                stroke="var(--apex-blue)"
                strokeWidth={3}
                strokeLinecap="round"
                style={{ pathLength: reduceMotion ? 1 : scrollYProgress }}
              />
            </svg>

            {modules.map(([title, headline, body, outcome], i) => {
              const Icon = stepIcons[i];
              const leftCard = i % 2 === 0;
              return (
                <div className="roadmap-row" key={title} style={{ minHeight: STEP_HEIGHT }}>
                  <span
                    className="roadmap-node"
                    aria-hidden="true"
                    style={{ left: `${(points[i].x / VIEWBOX_WIDTH) * 100}%` }}
                  >
                    {i + 1}
                  </span>
                  <motion.article
                    className={"step-card " + (leftCard ? "is-left" : "is-right")}
                    initial={{ opacity: 0, x: leftCard ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="step-card-head">
                      <span className="step-card-icon">
                        <Icon size={19} strokeWidth={1.9} />
                      </span>
                      <span className="step-card-eyebrow">MODULE 0{i + 1}</span>
                    </div>
                    <h3>{title}</h3>
                    <h4>{headline}</h4>
                    <p>{body}</p>
                    <span className="step-card-outcome">{outcome}</span>
                  </motion.article>
                </div>
              );
            })}
          </div>

          <p className="fineprint">
            A fifth module, Getting Started, is being filmed and is empty in your account until it
            lands. Supplier acceptance and terms vary, and Amazon decides selling approvals.
          </p>
        </section>

        <section className="software section">
          <div className="software-copy">
            <h2>Taught inside the software.</h2>
            <p>Not a course that talks about tools it cannot show you.</p>
            <p>
              The scanner, the purchase order builder and the analytics in these videos are the
              ones in your account. Watch a module, then open the screen it just showed you.
            </p>
            <a href={ENROL_HREF} className="text-cta">
              Start the Free Course <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="video-frame">
            <div className="video-bar">
              <span>APEX APPLICATIONS</span>
              <span>PRODUCT WALKTHROUGH</span>
            </div>
            <video
              controls
              playsInline
              preload="none"
              poster="/assets/demo-poster.jpg"
              src="https://www.apexapplications.io/videos/dashboard-hero-demo.mp4"
            >
              <a href="https://www.apexapplications.io/videos/dashboard-hero-demo.mp4">
                Watch the Apex product walkthrough
              </a>
            </video>
            <p>The software the course is taught in.</p>
          </div>
        </section>

        <section className="checklist section">
          <div className="checklist-title">
            <h2>
              What you will know
              <br />
              by the end.
            </h2>
            <p>Five things you cannot start without.</p>
            <img src="/assets/bull.png" alt="" loading="lazy" />
          </div>
          <ul>
            {[
              "What the wholesale model is, and what it asks of you.",
              "How to set yourself up so distributors open an account.",
              "Where to look for suppliers worth contacting.",
              "How to read a supplier catalogue and find what is worth buying.",
              "How to place a purchase order, and restock what sells.",
            ].map((t) => (
              <li key={t}>
                <span aria-hidden="true">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="booking section" id="enrol">
          <div className="booking-intro">
            <p className="eyebrow">YOUR NEXT STEP</p>
            <h2>
              Start the course.
              <br />
              <span className="blue">It costs nothing.</span>
            </h2>
            <p>
              Create a free Apex account and Apex University opens straight away. The Review
              Booster and three UPC scans come with it.
            </p>
            <p className="booking-note">
              No card is taken. There is no trial to run out, and nothing to cancel.
            </p>
          </div>

          <div className="booking-form">
            <p className="enrol-lead">Your free account includes</p>
            <ul className="enrol-list">
              {[
                ["Apex University", "Nine videos, four modules, from zero to your first order."],
                ["Review Booster", "Automated Amazon review requests on eligible orders."],
                ["3 UPC scans", "Run a supplier list through the scanner and see it work."],
              ].map(([name, detail]) => (
                <li key={name}>
                  <span aria-hidden="true">✓</span>
                  <span>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                </li>
              ))}
            </ul>
            <a className="booking-submit" href={ENROL_HREF}>
              Create My Free Account <span aria-hidden="true">→</span>
            </a>
            <p className="form-helper">
              Takes about a minute. No card required. Already enrolled?{" "}
              <a href={LOGIN_HREF}>Log in</a>.
            </p>
            <p className="fineprint">
              The course and these tools are free. The rest of the Apex software is on a paid plan.
            </p>
          </div>
        </section>

        <section className="faq section">
          <h2>
            A few things
            <br />
            you might be wondering.
          </h2>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="playbook section">
          <div className="section-heading">
            <p className="eyebrow">AFTER THE FREE COURSE</p>
            <h2>
              The Keepa Playbook,
              <br />
              and a head start with it.
            </h2>
            <p>
              The course teaches you to read a listing. The playbook is the worksheets you fill in
              while you do it: the roadmap, the profit maths, the supplier script and the purchase
              order. It comes in the {BUNDLE_PRICE} Starter Bundle, alongside the software and the
              suppliers to use it on.
            </p>
          </div>

          <div className="playbook-stage">
            {worksheets.map((sheet, i) => (
              <article className={`worksheet worksheet-${i + 1}`} key={sheet.title}>
                <p className="worksheet-eyebrow">APEX UNIVERSITY</p>
                <h3>{sheet.title}</h3>
                <p className="worksheet-blurb">{sheet.blurb}</p>

                {sheet.steps && (
                  <ol className="worksheet-steps">
                    {sheet.steps.map(([name, detail], n) => (
                      <li key={name}>
                        <span className="worksheet-step-n">{n + 1}</span>
                        <span>
                          <strong>{name}</strong>
                          <small>{detail}</small>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {sheet.rows && (
                  <table className="worksheet-table">
                    <tbody>
                      {sheet.rows.map(([label, value], n) => (
                        <tr key={label} className={n === sheet.highlightRow ? "is-result" : undefined}>
                          <th scope="row">{label}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {sheet.po && (
                  <table className="worksheet-table worksheet-po">
                    <thead>
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">SKU</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Unit</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheet.po.map((row) => (
                        <tr key={row[1]}>
                          {row.map((cell, n) => (
                            <td key={n}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                      <tr className="is-result">
                        <td colSpan={4}>Total</td>
                        <td>{sheet.poTotal}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </article>
            ))}

            <figure className="playbook-book">
              <img
                src="/images/zero-to-hero/keepa-playbook-book.webp"
                alt="The Apex Keepa Playbook, a bound workbook from Apex Applications"
                width={620}
                height={888}
                loading="lazy"
              />
              <figcaption>
                <span className="playbook-price">{BUNDLE_PRICE}</span>
                <span>one-time</span>
              </figcaption>
            </figure>
          </div>

          <div className="playbook-cta-wrap">
            <ul className="playbook-includes">
              {bundleExtras.map((extra) => (
                <li key={extra}>
                  <span aria-hidden="true">✓</span>
                  {extra}
                </li>
              ))}
            </ul>
            <a className="playbook-cta" href={BUNDLE_HREF}>
              Get the Starter Bundle for {BUNDLE_PRICE} <span aria-hidden="true">&rarr;</span>
            </a>
            <p className="form-helper">
              Instant access, one-time payment. The free course stays free either way.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href={origin}>
          <img src="/assets/bull.png" alt="" />
          <span>
            APEX<small>APPLICATIONS</small>
          </span>
        </a>
        <p>The wholesale business, taught for free.</p>
        <div className="footer-bottom">
          <span>© 2026 Apex Applications</span>
          <div>
            <a href={origin + "/privacy"}>Privacy Policy</a>
            <a href={origin + "/terms"}>Terms of Service</a>
          </div>
        </div>
        <p className="fineprint">
          This site is not part of or endorsed by Facebook. FACEBOOK is a trademark of Meta
          Platforms, Inc. Amazon is a trademark of Amazon.com, Inc. or its affiliates.
        </p>
      </footer>
    </div>
  );
}
