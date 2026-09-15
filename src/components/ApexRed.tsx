"use client";

import { motion } from "motion/react";
import { ArrowRight, Check, Container, Minus } from "lucide-react";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6 },
} as const;

/**
 * The date this page's scope list was checked against the application.
 *
 * A beta page without one is a roadmap: it reads as a promise, ages silently,
 * and nobody can tell whether "coming soon" was written last week or last year.
 */
const CHECKED_ON = "14 September 2026";

/** What works in the beta today, checked against the running application. */
const IN_BETA: string[] = [
  "Building an FBA shipment from your purchase orders, through Amazon's current Fulfillment Inbound API",
  "Packing and placement options returned by Amazon, with box contents, weights and dimensions",
  "Connecting a warehouse or prep centre, and sending the order ahead so they can reconcile what arrives",
  "Receiving counts back against the order, including short, damaged and over-delivered lines",
  "Prep costs per unit, carried into the landed cost behind your margins and price floors",
  "Prep billing and invoices between a seller and their prep centre",
  "Messaging between a seller and their prep centre against a specific shipment",
];

/** What it does not do. Stated so nobody buys a subscription expecting it. */
const NOT_IN_BETA: string[] = [
  "Discounted carrier rates. Apex does not resell freight and has no carrier agreement",
  "Automated 2D barcode or label printing workflows",
  "Marketplaces beyond Amazon US",
  "A guaranteed turnaround, SLA or support commitment while the module is in beta",
];

export default function ApexRed() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-full uppercase tracking-[0.1em] shadow-sm">
              <Container size={14} className="stroke-[3]" />
              Beta. Not a finished product
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.02]">
            Help shape the next Apex{" "}
            <span className="text-red-600">fulfillment workflow</span>.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-4 max-w-2xl mx-auto">
            Apex Red brings shipments, warehouses, prep centres and their billing into the same
            system that buys and prices your stock. It is in beta: the list below is what works
            today, not what is planned.
          </p>
          <p className="text-sm text-slate-400">Scope checked {CHECKED_ON}.</p>
        </motion.div>

        <motion.div {...fadeIn} className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border-2 border-red-100 bg-red-50/30 p-8">
            <h2 className="text-lg font-black tracking-tight text-slate-900 mb-1">
              Working in the beta today
            </h2>
            <p className="text-xs text-slate-500 mb-5">Checked {CHECKED_ON}</p>
            <ul className="space-y-3">
              {IN_BETA.map((item) => (
                <li key={item} className="flex gap-3 items-start text-sm text-slate-700 leading-relaxed">
                  <Check size={16} className="text-red-600 shrink-0 mt-0.5" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/*
            The other half of the same list. A beta page that only says what
            works is an advertisement; the reason to publish one is so somebody
            can decide against it before paying us.
          */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-black tracking-tight text-slate-900 mb-1">
              Not in the beta
            </h2>
            <p className="text-xs text-slate-500 mb-5">Do not plan around these</p>
            <ul className="space-y-3">
              {NOT_IN_BETA.map((item) => (
                <li key={item} className="flex gap-3 items-start text-sm text-slate-600 leading-relaxed">
                  <Minus size={16} className="text-slate-300 shrink-0 mt-0.5" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 md:p-12">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-3">
            Tell us how your operation actually works
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6 max-w-2xl">
            Beta places are given out against real operations rather than first come, first served.
            The useful things to tell us are your monthly shipment volume, how many people touch a
            shipment, what you use for listing and prep today, and which single step costs you the
            most time. That last answer is what decides what gets built next.
          </p>

          {/*
            Goes to the contact form, not to checkout. "Sign Up for Beta" used
            to open the paid trial signup, which is a different thing entirely
            and not what the button said.
          */}
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 rounded-[20px] bg-red-600 text-white px-8 py-4 font-black uppercase tracking-wide hover:bg-red-700 hover:scale-[1.03] transition-all"
          >
            Join the Apex Red beta <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            This opens our contact form. It does not start a subscription, take a card, or begin a
            trial, it sends us a message and we reply.
          </p>
        </motion.div>

        <motion.div {...fadeIn} className="mt-16">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-4">
            The rest of Apex is not in beta
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6 max-w-2xl">
            Sourcing, purchasing, repricing and profit reporting are live and included in every
            plan. If the bottleneck is deciding what to buy and what to charge rather than moving
            the boxes, you do not need to wait for Red.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Apex Green, catalog scanning", href: "/features/green" },
              { label: "Apex Gold, repricing", href: "/features/gold" },
              { label: "Apex Blue, profit and purchasing", href: "/features/blue" },
              { label: "What a plan costs", href: "/pricing" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-red-600 underline hover:text-red-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="mt-16 space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Common questions</h2>
          {[
            {
              q: "Can I replace my shipping software with this today?",
              a: "Compare the list above against what your operation actually needs, and decide from that rather than from a roadmap. If a function you depend on is in the second column, the answer is no.",
            },
            {
              q: "Does requesting beta access start a paid subscription?",
              a: "No. The button opens our contact form. No card, no trial, no subscription, it sends a message and we reply. Paid plans are a separate decision on the pricing page.",
            },
            {
              q: "Do I need a paid plan to be in the beta?",
              a: "Beta access is arranged with us directly. Tell us about your operation and we will tell you what is available and what it would cost, before anything is charged.",
            },
            {
              q: "When does Red leave beta?",
              a: "We are not going to give you a date we cannot keep. This page carries the date its scope was last checked, and the list changes as the work does.",
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-black text-slate-900 mb-1.5">{faq.q}</p>
              <p className="text-sm leading-relaxed text-slate-500">{faq.a}</p>
            </div>
          ))}
        </motion.div>

        <motion.div {...fadeIn} className="mt-16 border-t border-slate-200 pt-8">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
            Comparing shipping tools
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Apex vs Boxem", href: "/compare/boxem" },
              { label: "Apex vs 2D Workflow", href: "/compare/2d-workflow" },
              { label: "Apex vs InventoryLab / Seller 365", href: "/compare/inventorylab" },
              { label: "Choosing a prep centre", href: "/amazon-fba-prep-centers" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-slate-600 underline hover:text-red-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
