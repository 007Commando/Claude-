import { Lock, RotateCcw, ShieldCheck } from "lucide-react";

import {
  ANNUAL_DISCOUNT_PERCENT,
  TRIAL_DAYS,
  formatPrice,
  planById,
  type Plan,
} from "../config/offer";

/**
 * The plan's price, in words, for the sentence that says what happens on day 8.
 *
 * Read from offer.ts rather than kept here. This file used to hold its own copy
 * of every plan price, which is the single thing that config exists to prevent:
 * a number quoted on the page where the card is entered, drifting away from the
 * number Stripe will charge.
 */
function priceSentence(planId: Plan["id"], period: string) {
  const monthly = formatPrice(planById(planId).monthly);
  return period === "yearly"
    ? `${monthly} a month billed yearly, ${ANNUAL_DISCOUNT_PERCENT}% off`
    : `${monthly} a month`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * What actually happens over the next seven days, on the page where the
 * decision is made.
 *
 * A free trial that asks for a card raises exactly three questions: am I
 * charged now, when does it start, and can I get out. A buyer who cannot answer
 * them closes the tab. Stripe hosts the card form itself, so this is the last
 * surface we control before it, and the same promises are repeated there
 * through Checkout's custom text.
 */
export default function TrialTimeline({
  plan = "starter",
  period = "monthly",
}: {
  plan?: string;
  period?: string;
}) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const planId = (["starter", "plus", "pro", "enterprise"] as const).includes(
    plan as Plan["id"],
  )
    ? (plan as Plan["id"])
    : "starter";

  const steps = [
    {
      label: "Today",
      title: "Full access, $0 charged",
      body: "Your card is saved but not charged. Every tool opens the moment you finish: catalogue scans, the product database, Review Booster.",
    },
    {
      label: `Days 1 to ${TRIAL_DAYS}`,
      title: "Put it to work",
      body: "Connect your Amazon store and your own numbers fill the dashboard. This is the week to run a real supplier list through it.",
    },
    {
      label: formatDate(trialEnd),
      title: "Trial ends",
      body: `Your subscription starts at ${priceSentence(planId, period)}. Cancel any time before this date and you pay nothing.`,
    },
  ];

  const assurances = [
    [RotateCcw, "Cancel anytime", "One click in your dashboard"],
    [Lock, "Secured by Stripe", "We never see your card"],
    [ShieldCheck, "No charge today", "$0.00 due now"],
  ] as const;

  return (
    <div
      className="glow-edge rounded-2xl border bg-card p-6 sm:p-7"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
        Your {TRIAL_DAYS} free days
      </p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight text-foreground">
        Nothing is charged today.
      </h2>

      <ol className="mt-6">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    index === 0
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
                {!last && (
                  <span
                    className={`w-px flex-1 ${index === 0 ? "bg-primary/35" : "bg-border"}`}
                  />
                )}
              </div>
              <div className={last ? "" : "pb-6"}>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {step.label}
                </p>
                <p className="mt-1 text-base font-bold text-foreground">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
        {assurances.map(([Icon, title, detail]) => (
          <div key={title} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs font-bold text-foreground">
              {title}
              <span className="mt-0.5 block font-normal text-muted-foreground">{detail}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
