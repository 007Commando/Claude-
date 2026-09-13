"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import TrialTimeline from "./TrialTimeline";

const STORAGE_KEY = "apex_checkout";

const PLAN_LABELS: Record<string, string> = {
  starter: "Apex Starter",
  plus: "Apex Plus",
  pro: "Apex Pro",
  enterprise: "Apex Enterprise",
};

interface CheckoutHandoff {
  clientSecret: string;
  publishableKey: string;
  plan: string;
  period: string;
}

/**
 * Our own checkout page, with Stripe's card form mounted inside it.
 *
 * Stripe's hosted page can carry our words but not our layout, so the trial
 * timeline, the plan and the "nothing today" promise could only ever sit on
 * a page the buyer left behind. Embedded mode keeps them beside the card
 * field, where the questions actually get asked.
 */
export default function Checkout() {
  const [handoff, setHandoff] = useState<CheckoutHandoff | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(
    null,
  );
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setMissing(true);
        return;
      }
      const parsed = JSON.parse(raw) as CheckoutHandoff;
      if (!parsed.clientSecret || !parsed.publishableKey) {
        setMissing(true);
        return;
      }
      setHandoff(parsed);
      setStripePromise(loadStripe(parsed.publishableKey));
    } catch {
      setMissing(true);
    }
  }, []);

  const fetchClientSecret = useCallback(
    async () => handoff?.clientSecret || "",
    [handoff],
  );

  const planLabel = PLAN_LABELS[handoff?.plan || "starter"] || "Apex";
  const periodLabel = handoff?.period === "yearly" ? "Billed yearly" : "Billed monthly";

  return (
    <section className="relative min-h-screen overflow-hidden bg-white pt-28">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute left-1/3 top-1/4 h-[600px] w-[600px] rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 lg:px-10">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </Link>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
          {/* Card form — Stripe's, inside our page */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Start your free trial
            </h1>
            <p className="mt-2 text-slate-500">
              {planLabel} · 7 days free · nothing charged today
            </p>

            <div className="mt-8 min-h-[30rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)]">
              {missing ? (
                <div className="flex min-h-[28rem] flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    This checkout session has expired
                  </p>
                  <p className="max-w-sm text-sm text-slate-500">
                    Checkout sessions are single use and don&apos;t survive a
                    refresh. Pick your plan again and we&apos;ll take you
                    straight back here — your account is already created, so
                    you can also just log in.
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/pricing"
                      className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Choose a plan
                    </Link>
                    <Link
                      href="/auth"
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              ) : stripePromise && handoff ? (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ fetchClientSecret }}
                >
                  <EmbeddedCheckout className="min-h-[28rem]" />
                </EmbeddedCheckoutProvider>
              ) : (
                <div className="flex min-h-[28rem] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
              )}
            </div>
          </div>

          {/* The context Stripe's own page could never hold */}
          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Your plan
              </p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {planLabel}
              </p>
              <p className="text-sm text-slate-500">{periodLabel}</p>

              <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-semibold text-slate-600">
                  Due today
                </span>
                <span className="text-2xl font-black tabular-nums text-slate-900">
                  $0.00
                </span>
              </div>
            </div>

            <TrialTimeline
              plan={handoff?.plan || "starter"}
              period={handoff?.period || "monthly"}
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
