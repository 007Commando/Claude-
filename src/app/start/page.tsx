import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageCheck } from "lucide-react";

import SiteNavigation from "../../components/site/SiteNavigation";
import s from "../../components/landing/offer.module.css";

import purchaseOrders from "../../assets/purchase-orders.png.asset.json";
import marketDatabase from "../../assets/market-database.png.asset.json";
import vendorsDashboard from "../../assets/vendors-dashboard.png.asset.json";

export const metadata: Metadata = {
  title: "Start your Amazon wholesale business for $1 — Apex Applications",
  description:
    "Three authorized supplier accounts, the full Apex software suite, and an AI mentor that builds your first purchase order. Your first week for $1.",
  robots: { index: false, follow: false },
};

const SIGNUP = "/auth?mode=signup&plan=starter&period=monthly";

const ROWS = [
  {
    kicker: "The suppliers",
    title: "Three authorized accounts, open on day one.",
    body: "Most people never place a first wholesale order because no distributor replies. You start with three vetted accounts and the named contact who approves resellers — then three more every month you stay.",
    items: [
      ["Named contacts, not a scraped list", "The person who actually opens reseller accounts."],
      ["Vetted for Amazon-friendly terms", "Distributors that allow resale on the marketplace."],
      ["Three more every month", "Your catalogue keeps widening as you go."],
    ],
    art: vendorsDashboard.url,
    alt: "Supplier management inside Apex",
  },
  {
    kicker: "The software",
    title: "One workspace for sourcing, purchasing and profit.",
    body: "Scan a supplier catalogue, see what actually clears margin after fees, build the purchase order, then track the profit when it sells. The same job, in one place.",
    items: [
      ["Scan any supplier catalogue", "Columns are detected whatever format they send."],
      ["Honest numbers per unit", "Fees, prep and shipping included before you commit."],
      ["Purchase orders and analytics", "Connected, so the numbers follow the order."],
    ],
    art: marketDatabase.url,
    alt: "Apex product database with profit and ROI",
    flip: true,
  },
  {
    kicker: "The AI mentor",
    title: "It writes your first purchase order.",
    body: "The mentor reads your own catalogue, costs and stock, then hands you the next move with the numbers behind it — which products clear margin, how many units, and which supplier to send it to.",
    items: [
      ["Reads your real data", "Your catalogue and costs, not generic advice."],
      ["Shows the working", "Every step carries the profit and ROI that justified it."],
      ["Ends in a sent order", "Step by step to a PO, not a chat transcript."],
    ],
    art: purchaseOrders.url,
    alt: "Purchase order with projected revenue, margin and ROI",
  },
];

export default function StartPage() {
  return (
    <>
      <SiteNavigation />
      <main>
        <section className={s.hero}>
          <img className={s.heroArt} src="/images/landing/warehouse-hero.png" alt="" width={1536} height={1024} />
          <div className={s.heroContent}>
            <div className={s.badge}>
              <PackageCheck size={19} aria-hidden="true" />
              <span>The $1 starter offer</span>
            </div>
            <h1>
              Three suppliers, the software, and your first PO written for you.{" "}
              <span>For $1.</span>
            </h1>
            <p>
              Start your first week of Amazon wholesale with supplier accounts
              already open and an AI mentor that turns them into a purchase
              order.
            </p>
            <div className={s.actions}>
              <Link className={s.primary} href={SIGNUP}>
                Start for $1 <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link className={s.secondary} href="/how-it-works">
                See how it works
              </Link>
            </div>
            <p className={s.trialNote}>
              3 authorized suppliers included · Cancel any time · No long contract
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

        <section className={s.close}>
          <h2>One dollar to find out whether wholesale works for you.</h2>
          <p>
            Suppliers, software and a mentor that writes the first order. Cancel
            before the week is out and that is all you pay.
          </p>
          <Link className={s.primary} href={SIGNUP}>
            Start for $1 <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </section>
      </main>
    </>
  );
}
