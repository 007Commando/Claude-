import type { Metadata } from "next";

import { absoluteUrl } from "../../config/site";
import {
  rateRangeLabel,
  VA_TRIAL_DAYS,
  VA_TRIAL_DAYS_LABEL,
  VA_TRIAL_DAYS_WORD,
} from "../../lib/vaPricing";
import Link from "next/link";
import { ArrowRight, ClipboardList, UserCheck, Users } from "lucide-react";

import {
  Eyebrow,
  OfferHero,
  OfferRow,
  ProductFrame,
  Rail,
  ctaPrimary,
  ctaSecondary,
} from "../../components/landing/OfferKit";
import VaComparison, {
  SatisfactionGuarantee,
} from "../../components/landing/VaComparison";

import resourceLibrary from "../../assets/resource-library.png.asset.json";
import inventoryRestocking from "../../assets/inventory-restocking.png.asset.json";
import purchaseOrders from "../../assets/purchase-orders.png.asset.json";

export const metadata: Metadata = {
  title: "Apex Virtual Assistants, Trained Amazon Staff",
  description:
    "Professional Amazon-trained assistants, part time or full time, who install SOPs into your business. First 14 days free.",
  /**
   * Indexable, and the canonical it never had.
   *
   * This page was noindex and absent from the sitemap, which meant the only
   * way anyone reached it was a footer link or an ad. It is a real offer page
   * with an H1 and a service nobody else on the comparison list sells, so it
   * earns nothing by hiding.
   *
   * `/apex-vas` covers the same service and stays noindex deliberately. Two
   * indexable pages about one service compete with each other for the same
   * query and split whatever authority either would have had. If that one is
   * ever opened up instead, this one closes on the same day, not alongside it.
   */
  alternates: { canonical: absoluteUrl("/virtual-assistants") },
};

const CONTACT = "/contact-us";

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
      <OfferHero
        eyebrow={
          <Eyebrow icon={<Users size={14} />}>New. Apex Virtual Assistants</Eyebrow>
        }
        titleTop="Stop Gambling On Freelancers."
        titleAccent="Hire Amazon Professionals."
        lede="Upwork and Fiverr sell you hours. We place trained Amazon wholesale staff who install the SOPs your business runs on, so the process survives whoever is doing it."
        actions={
          <>
            <Link href={CONTACT} className={ctaPrimary}>
              Start {VA_TRIAL_DAYS} Days Free <ArrowRight size={18} />
            </Link>
            {/*
              Was an anchor to #compare, which is the very next section and
              reachable by scrolling. Pointing it at the quote builder makes it
              a step in the funnel instead of a no-op.

              /apex-vas/hire rather than /apex-vas since the VA offer split in
              two: the parent now sells the trial and books a meeting, and the
              rates and roster this button promises live on the child.
            */}
            <Link href="/apex-vas/hire" className={ctaSecondary}>
              See Rates And Availability
            </Link>
          </>
        }
        note={`First ${VA_TRIAL_DAYS_LABEL} free · Part time or full time · ${rateRangeLabel()} an hour, fixed`}
        art={<ProductFrame src={purchaseOrders.url} alt="Work an Apex assistant takes off your desk" />}
      />

      <VaComparison />

      <OfferRow
        eyebrow={
          <Eyebrow tone="purple" icon={<UserCheck size={14} />}>
            The difference
          </Eyebrow>
        }
        title="A freelancer does tasks. A trained assistant builds a process."
        body="The problem with hourly marketplaces is not the price; it is that nothing accumulates. Every hire starts from zero, and when they leave the knowledge leaves with them. Ours arrive knowing Amazon wholesale and write down how your business runs as they work."
        items={[
          ["Trained before day one", "Sourcing, ungating, purchase orders and prep, not general admin."],
          ["SOPs installed as they go", "Your process gets documented, so it outlasts any one person."],
          ["Works inside your Apex account", "Same catalogue, same numbers, with the permissions you set."],
        ]}
        art={<ProductFrame src={resourceLibrary.url} alt="SOP and resource library" />}
      />

      <OfferRow
        flip
        eyebrow={<Eyebrow icon={<ClipboardList size={14} />}>What they take off you</Eyebrow>}
        title="The work that quietly eats your week."
        body="Catalogue scanning, supplier follow-ups, restock checks and purchase orders keep an owner in the weeds. They are also the easiest work to hand over once the process is written down."
        items={[
          ["Sourcing and shortlisting", "Scans catalogues and surfaces what clears margin."],
          ["Supplier follow-up", "Chases distributor replies so accounts actually open."],
          ["Restock and purchase orders", "Keeps stock moving before the Buy Box is lost."],
        ]}
        art={<ProductFrame src={inventoryRestocking.url} alt="Restock dashboard" />}
      />

      <SatisfactionGuarantee />

      <section id="plans" className="py-12 sm:py-16 lg:py-20 bg-white">
        <Rail>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-[1.75rem] sm:text-4xl font-extrabold text-slate-900 mb-4 sm:mb-5 leading-tight">
              Part time or full time.
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Both start with {VA_TRIAL_DAYS_LABEL} free, so you can judge the work
              before you pay for it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="bg-white rounded-[28px] sm:rounded-[32px] border border-slate-200 p-7 sm:p-10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-3">
                  {plan.name}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                  {plan.hours}
                </p>
                <p className="text-slate-600 mb-8 leading-relaxed">{plan.body}</p>
                <Link href={CONTACT} className={`${ctaPrimary} w-full`}>
                  Start {VA_TRIAL_DAYS} Days Free
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-10 max-w-xl mx-auto">
            Both are billed at the same fixed {rateRangeLabel()} an hour. No platform
            fee, no agency retainer, no charge for the first {VA_TRIAL_DAYS_WORD} days.
          </p>
        </Rail>
      </section>

      <section className="py-14 sm:py-20 bg-slate-900">
        <Rail>
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-[1.875rem] sm:text-4xl lg:text-5xl font-black text-white mb-5 sm:mb-6 leading-tight tracking-tight">
              Your first week costs nothing.
            </h3>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Tell us what is eating your week. We will place someone who
              already knows how to do it.
            </p>
            <div className="flex justify-center">
              <Link href={CONTACT} className={ctaPrimary}>
                Start {VA_TRIAL_DAYS} Days Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Rail>
      </section>
    </>
  );
}
