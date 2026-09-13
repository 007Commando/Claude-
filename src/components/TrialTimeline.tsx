import { Lock, RotateCcw, ShieldCheck } from "lucide-react";

const PLAN_PRICES: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: "$149.99/month",
    yearly: "$149.99/month billed yearly (20% off)",
  },
  plus: { monthly: "your plan price", yearly: "your plan price" },
  pro: { monthly: "$299/month", yearly: "$299/month billed yearly (20% off)" },
  enterprise: { monthly: "your plan price", yearly: "your plan price" },
};

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
 * A free trial that asks for a card raises exactly three questions — am I
 * charged now, when does it start, and can I get out — and a buyer who
 * can't answer them closes the tab. Stripe hosts the card form itself, so
 * this is the last surface we control before it; the same promises are
 * repeated there through Checkout's custom text.
 */
export default function TrialTimeline({
  plan = "starter",
  period = "monthly",
}: {
  plan?: string;
  period?: string;
}) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const price =
    PLAN_PRICES[plan]?.[period === "yearly" ? "yearly" : "monthly"] ||
    PLAN_PRICES.starter.monthly;

  const steps = [
    {
      title: "Today — full access, $0 charged",
      body: "Your card is saved but not charged. Every tool opens the moment you finish: catalog scans, the product database, Review Booster.",
      active: true,
    },
    {
      title: "Days 1–7 — put it to work",
      body: "Connect your Amazon store and your own numbers fill the dashboard. This is the week to run a real supplier list through it.",
      active: false,
    },
    {
      title: `${formatDate(trialEnd)} — trial ends`,
      body: `Your subscription starts at ${price}. Cancel any time before this date and you pay nothing.`,
      active: false,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)]">
      <h2 className="text-lg font-black tracking-tight text-slate-900">
        How your 7-day free trial works
      </h2>

      <ol className="mt-5 space-y-0">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 block h-3 w-3 shrink-0 rounded-full ${
                  step.active ? "bg-brand" : "bg-slate-300"
                }`}
              />
              {index < steps.length - 1 && (
                <span
                  className={`w-0.5 flex-1 ${
                    step.active ? "bg-brand" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
            <div className={index < steps.length - 1 ? "pb-6" : ""}>
              <p className="text-sm font-bold text-slate-900">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-xs font-semibold text-slate-700">
            Cancel anytime
            <span className="block font-normal text-slate-500">
              One click in your dashboard
            </span>
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-xs font-semibold text-slate-700">
            Secured by Stripe
            <span className="block font-normal text-slate-500">
              We never see your card
            </span>
          </p>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-xs font-semibold text-slate-700">
            No charge today
            <span className="block font-normal text-slate-500">
              $0.00 due now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
