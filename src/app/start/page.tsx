import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, PackageCheck, Store } from "lucide-react";

import {
  CheckList,
  Eyebrow,
  OfferHero,
  OfferRow,
  SceneFrame,
  VideoFrame,
  Rail,
  ctaPrimary,
  ctaSecondary,
} from "../../components/landing/OfferKit";

import DistributorStrip from "../../components/landing/DistributorStrip";

import sourcingSpeed from "../../assets/sourcing-speed.mp4.asset.json";
import { formatPrice, planById } from "../../config/offer";
import { DISTRIBUTOR_COUNT } from "../../data/distributorStats";

// Accuracy pass 2026-10-07: "authorized / vetted" suppliers, "accounts already open", "full Apex software suite" and
// "writes the order / sent purchase order" were not supportable. The trial is the Starter plan (Black, Blue, Green; no
// repricer), the three suppliers are distributors from the Vault, and the mentor answers questions and walks the seller
// through the order, which the seller builds and submits themselves.

export const metadata: Metadata = {
  title: "Start your Amazon wholesale business free for 7 days, Apex Applications",
  description:
    "Three starting suppliers, the Apex software on the Starter plan, and an AI mentor that walks you through your first purchase order. Free for your first 7 days.",
  robots: { index: false, follow: false },
};

const SIGNUP = "/auth?mode=signup&plan=starter&period=monthly";

export default function StartPage() {
  return (
    <>
      <OfferHero
        eyebrow={
          <Eyebrow icon={<PackageCheck size={14} />}>The 7-day starter offer</Eyebrow>
        }
        titleTop="Three Suppliers. The Software. Your First PO."
        titleAccent="Free For Seven Days."
        lede="Most sellers never place a first wholesale order because they do not know who to contact. Start with three distributors to reach out to, and an AI mentor that walks you through the purchase order."
        actions={
          <>
            <Link href={SIGNUP} className={ctaPrimary}>
              Start 7 Days Free <ArrowRight size={18} />
            </Link>
            <Link href="/how-it-works" className={ctaSecondary}>
              How It Works
            </Link>
          </>
        }
        note="3 suppliers included · No card charged for 7 days · Cancel any time"
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
        title="Three suppliers, open on day one."
        body="Research tools tell you what to sell. None of them give you distributors to start from. Your first week opens three US wholesale distributors from the Distributor Vault, with their websites and contact emails in your account."
        items={[
          ["Contacts in your account", "A website and contact email for each distributor."],
          ["US wholesale distributors", `Drawn from a Vault of ${DISTRIBUTOR_COUNT}.`],
          ["Three more every month you stay", "Your catalogue keeps widening as you grow."],
        ]}
        below={<DistributorStrip />}
        art={
          <SceneFrame
            src="/images/vendors-with-products.webp"
            alt="The Apex vendor list surrounded by the branded products a wholesale seller sources"
          />
        }
      />

      <OfferRow
        flip
        eyebrow={<Eyebrow icon={<Bot size={14} />}>The AI mentor</Eyebrow>}
        title="It answers your questions and walks you through the order."
        body="Ask the mentor about a supplier, a product or the next step, and it points you to the move that follows. You build and submit the purchase order yourself in Apex."
        items={[
          ["Answers your questions", "Ask about a supplier, a product or a step in the order."],
          ["Walks you through it", "One step at a time, from catalogue to purchase order."],
          ["You send the order", "You build and submit the purchase order yourself. Nothing is sent for you."],
        ]}
        art={
          <VideoFrame
            src={sourcingSpeed.url}
            label="Sourcing analysis running across a supplier catalogue"
            variant="panel"
            lazy
          />
        }
      />

      <section className="py-14 sm:py-20 bg-slate-900">
        <Rail>
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-[1.875rem] sm:text-4xl lg:text-5xl font-black text-white mb-5 sm:mb-6 leading-tight tracking-tight">
              Seven days to find out whether wholesale works for you.
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 leading-relaxed">
              Suppliers, software and a mentor that walks you through the first order.
              Cancel before the week is out and you are charged nothing at all.
            </p>
            <div className="flex justify-center">
              <Link href={SIGNUP} className={ctaPrimary}>
                Start 7 Days Free <ArrowRight size={18} />
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              {formatPrice(planById("starter").monthly)} a month after the trial. Cancel any time before it ends.
            </p>
          </div>
        </Rail>
      </section>
    </>
  );
}
