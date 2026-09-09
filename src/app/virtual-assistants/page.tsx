import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";

import SiteNavigation from "../../components/site/SiteNavigation";
import s from "../../components/landing/offer.module.css";

import resourceLibrary from "../../assets/resource-library.png.asset.json";
import purchaseOrders from "../../assets/purchase-orders.png.asset.json";
import inventoryRestocking from "../../assets/inventory-restocking.png.asset.json";

export const metadata: Metadata = {
  title: "Apex Virtual Assistants — trained Amazon staff, not freelancers",
  description:
    "Professional Amazon-trained assistants, part time or full time, who install SOPs into your business. First 7 days free.",
  robots: { index: false, follow: false },
};

const CONTACT = "/contact-us";

const ROWS = [
  {
    kicker: "The difference",
    title: "A freelancer does tasks. A trained assistant builds a process.",
    body: "The problem with hourly marketplaces is not price — it is that nothing accumulates. Every hire starts from zero, and when they leave the knowledge leaves with them. Ours arrive knowing Amazon wholesale and write down how your business runs as they work.",
    items: [
      ["Trained before day one", "Sourcing, ungating, purchase orders and prep — not general admin."],
      ["SOPs installed as they go", "Your process gets documented, so it outlasts any one person."],
      ["Works inside your Apex account", "Same catalogue, same numbers, with the permissions you set."],
    ],
    art: resourceLibrary.url,
    alt: "SOP and resource library",
  },
  {
    kicker: "What they take off you",
    title: "The work that quietly eats your week.",
    body: "Catalogue scanning, supplier follow-ups, restock checks and purchase orders are the jobs that keep an owner in the weeds. They are also the easiest to hand over once the process is written down.",
    items: [
      ["Sourcing and shortlisting", "Scans catalogues and surfaces what clears margin."],
      ["Supplier follow-up", "Chases distributor replies so accounts actually open."],
      ["Restock and purchase orders", "Keeps stock moving before the Buy Box is lost."],
    ],
    art: inventoryRestocking.url,
    alt: "Restock dashboard",
    flip: true,
  },
];

const PLANS = [
  {
    name: "Part time",
    hours: "20 hours a week",
    body: "Sourcing support, catalogue upkeep and supplier follow-ups alongside you.",
  },
  {
    name: "Full time",
    hours: "40 hours a week",
    body: "Owns the day-to-day so you can work on the business instead of in it.",
  },
];

export default function VirtualAssistantsPage() {
  return (
    <>
      <SiteNavigation />
      <main>
        <section className={s.hero}>
          <img className={s.heroArt} src="/images/landing/warehouse-hero.png" alt="" width={1536} height={1024} />
          <div className={s.heroContent}>
            <div className={s.badge}>
              <Users size={19} aria-hidden="true" />
              <span>New — Apex Virtual Assistants</span>
            </div>
            <h1>
              Stop gambling on freelancers.{" "}
              <span>Hire Amazon professionals.</span>
            </h1>
            <p>
              Upwork and Fiverr sell you hours. We place trained Amazon
              wholesale staff who install the SOPs your business runs on — so
              the process survives whoever is doing it.
            </p>
            <div className={s.actions}>
              <Link className={s.primary} href={CONTACT}>
                Start 7 days free <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link className={s.secondary} href="#plans">
                Compare plans
              </Link>
            </div>
            <p className={s.trialNote}>
              First 7 days free · Part time or full time · Competitive professional rates
            </p>
          </div>
        </section>

        <section className={s.rows}>
          {ROWS.map((row) => (
            <div key={row.kicker} className={`${s.row} ${row.flip ? s.flip : ""}`}>
              <div>
                <p className={s.kicker}>{row.kicker}</p>
                <h2>{row.title}</h2>
                <p>{row.body}</p>
                <ul className={s.list}>
                  {row.items.map(([title, detail]) => (
                    <li key={title}>
                      <CheckCircle2 size={18} color="#1387ed" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        <b>{title}</b>
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className={s.art}>
                  <img src={row.art} alt={row.alt} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section id="plans" className={s.plans}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <p className={s.kicker}>Two ways to hire</p>
            <h2 style={{ fontSize: "clamp(28px,3.2vw,40px)", fontWeight: 700, letterSpacing: "-.045em", margin: "12px 0 12px", color: "#0b2033" }}>
              Part time or full time.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#5a7286" }}>
              Both start with 7 days free, so you can judge the work before you
              pay for it.
            </p>
          </div>

          <div className={s.planGrid}>
            {PLANS.map((plan) => (
              <div key={plan.name} className={s.plan}>
                <h3>{plan.name}</h3>
                <strong>{plan.hours}</strong>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#5a7286" }}>{plan.body}</p>
                <Link className={s.primary} href={CONTACT} style={{ marginTop: 22, width: "100%" }}>
                  Start 7 days free
                </Link>
              </div>
            ))}
          </div>

          <p style={{ maxWidth: 620, margin: "26px auto 0", textAlign: "center", fontSize: 13.5, color: "#8fa5b5" }}>
            Rates are quoted on a short call once we know what you need covered.
          </p>
        </section>

        <section className={s.close}>
          <h2>Your first week costs nothing.</h2>
          <p>
            Tell us what is eating your week. We will place someone who already
            knows how to do it.
          </p>
          <Link className={s.primary} href={CONTACT}>
            Start 7 days free <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </section>
      </main>
    </>
  );
}
