"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  Boxes,
  CalendarCheck,
  MessagesSquare,
  PackageCheck,
  Receipt,
  UserPlus,
  Users,
} from "lucide-react";

/**
 * The page prep centres land on (October 2026).
 *
 * Apex began as software for prep centres and warehouses, and is free for
 * them. Signing up creates the account, but the tools open only after an
 * onboarding call with Stefano (the app holds them on its onboarding page,
 * and the API refuses /prep until he approves them). The copy says that up
 * front so nobody signs up expecting to be let straight in.
 */

const SIGNUP_URL = "https://app.apexapplications.io/auth/register/prep";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6 },
} as const;

const TOOLS = [
  {
    icon: PackageCheck,
    title: "Receiving",
    body: "Your client sends their inbound before it leaves the supplier. When the boxes land, your team checks it in line by line: what arrived, what is missing, what is damaged, what went to storage. The client sees the same counts you do.",
  },
  {
    icon: Boxes,
    title: "FBA shipment creation",
    body: "Turn received stock into an Amazon shipment for that client. Pick the packing option, enter boxes and weights, choose placement and the carrier, then print the box and pallet labels without logging in to their Seller Central.",
  },
  {
    icon: Users,
    title: "Every client in one place",
    body: "Invite your sellers by email. Each one gets their own rates, their own inbound and their own shipments, and your team switches between them without a stack of logins and spreadsheets.",
  },
  {
    icon: Receipt,
    title: "Billing that adds itself up",
    body: "Set your prep services and storage rates once per client. Charges collect as your team works each shipment, and you send them as Stripe invoices straight to your own Stripe account.",
  },
  {
    icon: MessagesSquare,
    title: "Prep chat",
    body: "Talk to each client inside Apex, next to their shipment, instead of chasing threads across email, WhatsApp and text.",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Two minutes. Your business, your warehouse address and a phone number. No card.",
  },
  {
    icon: CalendarCheck,
    title: "Onboarding call with Stefano",
    body: "Stefano, our founder, walks you through it himself. We set up your rates, invite your first client and receive a shipment together.",
  },
  {
    icon: PackageCheck,
    title: "Your account opens",
    body: "Right after the call we switch everything on, and you can bring the rest of your clients over at your own pace.",
  },
];

const FAQ = [
  {
    q: "Is it really free for prep centers?",
    a: "Yes. There is no plan, no card and no trial for prep centers. Your sellers are Amazon businesses, and Apex earns its living from the sourcing, pricing and profit tools they use to run them. Making your side free is how we get to be the software you both share.",
  },
  {
    q: "Why do I need an onboarding call before I can use it?",
    a: "Prep work is different in every warehouse, and the first week decides whether software sticks. We would rather spend half an hour with you getting your rates, clients and first shipment right than hand you a login and hope. It also means we can keep Apex for prep centers that are actually doing FBA prep.",
  },
  {
    q: "Can my team use it too?",
    a: "Yes. Add your team as users and choose what each person can see and do, so the floor can receive and box shipments without seeing your billing.",
  },
  {
    q: "Where does the money from invoices go?",
    a: "To your own Stripe account. You connect Stripe during setup, and Apex never holds your money.",
  },
  {
    q: "Which marketplaces does it support?",
    a: "Amazon US today.",
  },
];

export default function ForPrepCenters() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="max-w-3xl mx-auto text-center">
          <h1 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-red-700">
            Software for prep centers and warehouses
          </h1>
          <p className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.02]">
            Run your FBA clients in one place.{" "}
            <span className="text-red-600">Free for prep centers.</span>
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Receive your clients&apos; inventory, build their Amazon shipments, bill them and talk to
            them, all from one account. Apex started as software for prep centers, and it is free for
            you to use with every seller you work with.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center gap-2 rounded-[20px] bg-red-600 text-white px-8 py-4 font-black uppercase tracking-wide hover:bg-red-700 hover:scale-[1.03] transition-all"
            >
              Create your free account <ArrowRight size={18} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-4 font-bold text-slate-700 hover:text-red-600 transition-colors"
            >
              How onboarding works
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            No card. Your account opens after a short onboarding call with our founder.
          </p>
        </motion.div>

        <motion.div {...fadeIn} className="mt-24">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3 text-center">
            What your team does in Apex
          </h2>
          <p className="text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto text-center">
            From the moment a client&apos;s supplier ships to the moment the boxes leave for Amazon.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {TOOLS.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`rounded-3xl border border-slate-200 bg-white p-8 ${
                  i === TOOLS.length - 1 ? "md:col-span-2" : ""
                }`}
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-5">
                  <Icon size={20} />
                </span>
                <h3 className="text-lg font-black tracking-tight text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeIn} id="how-it-works" className="mt-24 scroll-mt-32">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3 text-center">
            How getting started works
          </h2>
          <p className="text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto text-center">
            Apex is not open to every warehouse. We onboard each prep center personally, so your
            account opens once we have set it up together.
          </p>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="rounded-3xl border-2 border-red-100 bg-red-50/30 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-9 items-center justify-center rounded-full bg-red-600 text-white text-sm font-black">
                    {i + 1}
                  </span>
                  <Icon size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div {...fadeIn} className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-8 text-center">
            Questions prep centers ask
          </h2>
          <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold text-slate-900">
                  {q}
                  <span className="text-red-600 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...fadeIn}
          className="mt-24 rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3">
            Want to see it with your own clients?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Create your account and tell us a good time to talk. We will set it up with you on the
            call and receive your first shipment together.
          </p>
          <a
            href={SIGNUP_URL}
            className="inline-flex items-center gap-2 rounded-[20px] bg-red-600 text-white px-8 py-4 font-black uppercase tracking-wide hover:bg-red-700 hover:scale-[1.03] transition-all"
          >
            Create your free account <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
