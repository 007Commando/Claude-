import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, PackageCheck, Store } from "lucide-react";

import {
  CheckList,
  Eyebrow,
  OfferHero,
  OfferRow,
  ProductFrame,
  VideoFrame,
  Rail,
  ctaPrimary,
  ctaSecondary,
} from "../../components/landing/OfferKit";

import DistributorStrip from "../../components/landing/DistributorStrip";

import purchaseOrders from "../../assets/purchase-orders.png.asset.json";
import vendorsDashboard from "../../assets/vendors-dashboard.png.asset.json";

export const metadata: Metadata = {
  title: "Start your Amazon wholesale business for $1 — Apex Applications",
  description:
    "Three authorized supplier accounts, the full Apex software suite, and an AI mentor that builds your first purchase order. Your first week for $1.",
  robots: { index: false, follow: false },
};

const SIGNUP = "/auth?mode=signup&plan=starter&period=monthly";

export default function StartPage() {
  return (
    <>
      <OfferHero
        eyebrow={
          <Eyebrow icon={<PackageCheck size={14} />}>The $1 starter offer</Eyebrow>
        }
        titleTop="Three Suppliers. The Software. Your First PO."
        titleAccent="All For One Dollar."
        lede="Most sellers never place a first wholesale order because no distributor replies. Start with three accounts already open, and an AI mentor that turns them into a purchase order."
        actions={
          <>
            <Link href={SIGNUP} className={ctaPrimary}>
              Start for $1 <ArrowRight size={18} />
            </Link>
            <Link href="/how-it-works" className={ctaSecondary}>
              How It Works
            </Link>
          </>
        }
        note="3 authorized suppliers included · Cancel any time · No long contract"
        art={
          <VideoFrame
            src="/videos/dashboard-hero-demo.mp4"
            label="A walkthrough of the Apex dashboard"
          />
        }
      />

      <OfferRow
        eyebrow={
          <Eyebrow tone="purple" icon={<Store size={14} />}>
            Suppliers: the part nobody else gives you
          </Eyebrow>
        }
        title="Three authorized accounts, open on day one."
        body="Research tools tell you what to sell. None of them get a distributor to open an account for you. Your first week includes three vetted accounts with the contact who actually approves resellers."
        items={[
          ["Named contacts, not a scraped list", "The person who opens reseller accounts, with a direct email."],
          ["Vetted for Amazon-friendly terms", "Distributors that permit resale on the marketplace."],
          ["Three more every month you stay", "Your catalogue keeps widening as you grow."],
        ]}
        below={<DistributorStrip />}
        art={<ProductFrame src={vendorsDashboard.url} alt="Supplier management inside Apex" />}
      />

      <OfferRow
        flip
        eyebrow={<Eyebrow icon={<Bot size={14} />}>The AI mentor</Eyebrow>}
        title="It doesn't just answer questions. It writes the order."
        body="The mentor reads your own catalogue, costs and stock, then hands you the next move with the numbers behind it — which products clear margin, how many units, and which supplier to send it to."
        items={[
          ["Reads your real data", "Your catalogue and your costs, not generic advice."],
          ["Shows the working", "Every step carries the profit and ROI that justified it."],
          ["Ends in a sent purchase order", "Step by step to an order, not a chat transcript."],
        ]}
        art={<ProductFrame src={purchaseOrders.url} alt="A purchase order with projected revenue, margin and ROI" />}
      />

      <section className="py-20 bg-slate-900">
        <Rail>
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              One dollar to find out whether wholesale works for you.
            </h3>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Suppliers, software and a mentor that writes the first order.
              Cancel before the week is out and that is all you pay.
            </p>
            <div className="flex justify-center">
              <Link href={SIGNUP} className={ctaPrimary}>
                Start for $1 <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Rail>
      </section>
    </>
  );
}
