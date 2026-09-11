"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { z } from "zod";
import Link from "next/link";
import {
  Mail,
  Lock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  User,
  CreditCard,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import michaelRAsset from "../assets/michael-r-avatar.png.asset.json";
import { readStoredAttribution } from "./LeadAttribution";
import {
  getAuthUserEmail,
  hasActiveSubscription,
} from "../lib/subscriptionGate";

// Global ApexAuth from https://app.apexapplications.io/apex-auth.js
declare global {
  interface Window {
    ApexAuth?: {
      signIn: (
        email: string,
        password: string,
        opts?: { redirect?: boolean },
      ) => Promise<unknown>;
      signUp: (opts: {
        name: string;
        email: string;
        password: string;
        plan?: "starter" | "plus" | "pro" | "enterprise";
        period?: "monthly" | "yearly";
      }) => Promise<unknown>;
      signInWithGoogle?: (opts?: {
        plan?: "starter" | "plus" | "pro" | "enterprise";
        period?: "monthly" | "yearly";
      }) => Promise<unknown>;
      sendPasswordResetEmail: (email: string) => Promise<unknown>;
      signOut: (opts?: { clearApp?: boolean }) => Promise<unknown> | void;
      getIdToken?: () => Promise<string | null>;
      redirectToApp: (path?: string) => void;
      redirectBackToApp?: (redirectUri?: string) => Promise<unknown>;
      getCurrentUser: () => Promise<unknown>;
      onAuthStateChanged: (
        cb: (user: unknown) => void,
      ) => (() => void) | void | Promise<(() => void) | void>;
    };
    // ChatGPT Ads pixel, initialized in layout.tsx
    oaiq?: (...args: unknown[]) => void;
  }
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter a password"),
});

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter a password"),
});

type Mode = "login" | "signup" | "forgot";

const nameField = z.string().trim().min(1, "Enter your name").max(120);
const emailField = z.string().trim().email("Enter a valid email").max(255);
// Signup enforces Firebase's real minimum so the error shows up on blur
// instead of after a round trip to the server; login just checks non-empty,
// since an existing account may predate that minimum.
const signupPasswordField = z.string().min(6, "At least 6 characters");
const loginPasswordField = z.string().min(1, "Enter a password");

function validateField(
  field: "name" | "email" | "password",
  value: string,
  mode: Mode,
): string | undefined {
  const schema =
    field === "name"
      ? nameField
      : field === "email"
        ? emailField
        : mode === "signup"
          ? signupPasswordField
          : loginPasswordField;
  const parsed = schema.safeParse(value);
  return parsed.success ? undefined : parsed.error.issues[0].message;
}

function getFriendlyAuthError(message: string): string {
  if (/is not a function/i.test(message)) {
    return "The login service didn't finish loading in time. Please try again.";
  }

  const codeMatch = message.match(/\(auth\/([a-z-]+)\)/);
  if (!codeMatch) return message;

  switch (codeMatch[1]) {
    case "invalid-credential":
    case "wrong-password":
    case "user-not-found":
      return "Incorrect email or password. Please try again.";
    case "invalid-email":
      return "Enter a valid email address.";
    case "user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "account-exists-with-different-credential":
      return "An account with this email already exists. Log in with your password instead.";
    case "popup-closed-by-user":
    case "cancelled-popup-request":
      return "";
    case "weak-password":
      return "Choose a stronger password (at least 6 characters).";
    case "network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// If ApexAuth's own internal setup (e.g. its Firebase init) hasn't finished
// by the time we call into it, calls fail with a raw "X is not a function"
// TypeError. window.ApexAuth existing doesn't guarantee that setup is done,
// so retry once after a short delay before giving up.
async function withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (!/is not a function/i.test(msg)) throw err;
    await new Promise((resolve) => setTimeout(resolve, 700));
    return fn();
  }
}

function waitForApexAuth(
  timeoutMs = 8000,
): Promise<NonNullable<Window["ApexAuth"]>> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.ApexAuth) return resolve(window.ApexAuth);
      if (Date.now() - start > timeoutMs)
        return reject(new Error("Auth service unavailable. Please refresh."));
      setTimeout(tick, 100);
    };
    tick();
  });
}

const PLAN_TIERS = ["starter", "plus", "pro", "enterprise"] as const;
const PERIODS = ["monthly", "yearly"] as const;
const PLAN_TIER_LABELS: Record<(typeof PLAN_TIERS)[number], string> = {
  starter: "Starter",
  plus: "Plus",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function Auth() {
  const params = useSearchParams();
  const router = useRouter();
  const modeFromParams: Mode =
    params.get("mode") === "signup"
      ? "signup"
      : params.get("mode") === "forgot"
        ? "forgot"
        : "login";
  // Tab clicks flip this immediately so the UI never waits on a router
  // round-trip; it's reconciled back to null once the URL catches up.
  const [modeOverride, setModeOverride] = useState<Mode | null>(null);
  const mode = modeOverride ?? modeFromParams;

  useEffect(() => {
    setModeOverride(null);
  }, [modeFromParams]);

  // Defaults ensure every signup carries a plan — even someone who lands on
  // a bare /auth (e.g. the header "Log In" link) and switches to Sign Up
  // from inside the page still triggers Stripe checkout, never a free
  // account with direct app access.
  const planParam = params.get("plan");
  const planTier = PLAN_TIERS.find((p) => p === planParam) ?? "starter";
  const periodParam = params.get("period");
  const period = PERIODS.find((p) => p === periodParam) ?? "monthly";

  const formCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    formCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Per-field errors surface the moment someone leaves a bad field, instead
  // of making them submit the whole form just to find out it's wrong.
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  // Set when a signed-in user has no active Stripe subscription — blocks the
  // dashboard redirect below and shows a payment-required notice instead.
  const [needsPayment, setNeedsPayment] = useState(false);

  const handleFieldBlur = (
    field: "name" | "email" | "password",
    value: string,
  ) => {
    // Skip validating a field the user never actually typed into — e.g.
    // autofocus landing on an empty field, then clicking straight to
    // "Continue with Google" shouldn't slap a "required" error on it.
    // Submitting the form still catches a truly empty required field.
    if (!value) return;
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value, mode),
    }));
  };

  // First relevant field gets focus automatically on load and on every tab
  // switch, so typing can start immediately without an extra click.
  const firstFieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [mode]);

  // Set the instant a signup submission starts, and never cleared — once this
  // page has kicked off account creation, it must never independently decide
  // to send the new user to /dashboard. That decision belongs entirely to
  // ApexAuth.signUp()'s own post-signup redirect (to Stripe checkout, since a
  // plan is always attached). Without this guard, Firebase's auth state
  // flips to "signed in" ~synchronously on account creation, while spinning
  // up a Checkout Session is an async round trip — the onAuthStateChanged
  // listener below would win that race and drop brand-new, unpaid signups
  // straight into the dashboard before checkout ever loads.
  const signupInFlightRef = useRef(false);

  // Signing out in the app only clears the app domain's Firebase session; this
  // domain keeps its own. Without this the app hands a signed-out user back
  // here, the listener below sees a still-valid session and forwards them
  // straight into the app again — so "log out" reads as "log back in" and
  // switching accounts is impossible. The app appends ?switch=1 on sign-out.
  const switchingAccount = params.get("switch") === "1";
  // Held true from first render until the old session is actually gone, so the
  // listener below cannot forward on it while the sign-out is still in flight.
  const suppressForwardRef = useRef(switchingAccount);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!switchingAccount || startedRef.current) return;
    startedRef.current = true;
    waitForApexAuth()
      // clearApp:false is essential — the default bounces through the app's
      // logout page and back to this URL, which still carries ?switch=1 and
      // would start the whole round trip again.
      .then((auth) => Promise.resolve(auth.signOut({ clearApp: false })))
      .catch(() => undefined)
      .finally(() => {
        suppressForwardRef.current = false;
        // Drop the flag so a refresh doesn't sign a fresh session straight out.
        const url = new URL(window.location.href);
        url.searchParams.delete("switch");
        window.history.replaceState({}, "", url.toString());
      });
  }, [switchingAccount]);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | void;
    waitForApexAuth()
      .then(async (auth) => {
        if (cancelled) return;
        const fn = await Promise.resolve(
          auth.onAuthStateChanged((user) => {
            if (!user || signupInFlightRef.current) return;
            // Arrived here specifically to change accounts: never auto-forward
            // on the session we are in the middle of clearing.
            if (suppressForwardRef.current) return;
            const redirect = new URL(window.location.href).searchParams.get(
              "redirect_uri",
            );

            const userEmail = getAuthUserEmail(user);
            // The app sends users here with a redirect_uri when it needs a
            // session. Someone who is already signed in must be handed straight
            // back, otherwise they sit on this form staring at a login box
            // while the app keeps bouncing them here — an endless loop.
            const sendToApp = () => {
              if (redirect && auth.redirectBackToApp) {
                auth.redirectBackToApp(redirect).catch(() => {
                  auth.redirectToApp("/dashboard");
                });
              } else {
                auth.redirectToApp("/dashboard");
              }
            };

            if (!userEmail) {
              // Can't verify subscription status without an email to look up
              // — fall back to the previous behavior rather than block someone
              // we have no way to check.
              sendToApp();
              return;
            }

            hasActiveSubscription(userEmail).then((subscribed) => {
              if (cancelled) return;
              if (subscribed) {
                setNeedsPayment(false);
                sendToApp();
              } else {
                setNeedsPayment(true);
              }
            });
          }),
        );
        if (cancelled) {
          if (typeof fn === "function") fn();
        } else {
          unsub = fn;
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const setMode = (m: Mode) => {
    setError(null);
    setInfo(null);
    setFieldErrors({});
    setModeOverride(m);
    const next = new URLSearchParams(params.toString());
    if (m === "login") next.delete("mode");
    else next.set("mode", m);
    const qs = next.toString();
    // scroll: false — without it, Next.js resets scroll to top on navigate,
    // yanking the form off-screen (it sits below a tall hero) and making the
    // tab switch look broken even though the mode did change underneath.
    router.replace(qs ? `/auth?${qs}` : "/auth", { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const auth = await waitForApexAuth();
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ name, email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        signupInFlightRef.current = true;
        await withAuthRetry(() =>
          auth.signUp({
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
            plan: planTier,
            period,
          }),
        );
        const attribution = readStoredAttribution();
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: attribution?.source ?? "direct",
            event: "apex_signup",
            email: parsed.data.email,
            visitorId: attribution?.visitorId,
            utmSource: attribution?.utmSource,
            utmMedium: attribution?.utmMedium,
            utmCampaign: attribution?.utmCampaign,
          }),
          keepalive: true,
        }).catch(() => {});
        window.oaiq?.("measure", "trial_started", { type: "plan_enrollment" });
        fetch("/api/oaiq-conversion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceUrl: window.location.href }),
          keepalive: true,
        }).catch(() => {});
        // Auto-redirects: to Stripe checkout if a plan was selected, otherwise into the app
      } else if (mode === "forgot") {
        const parsed = z
          .string()
          .trim()
          .email("Enter a valid email")
          .safeParse(email);
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        try {
          await withAuthRetry(() => auth.sendPasswordResetEmail(parsed.data));
        } catch (err) {
          // The reset-email endpoint returns a non-JSON success body, which
          // ApexAuth's own response parsing chokes on even though the email
          // was actually sent — don't surface that as a failure.
          const msg = err instanceof Error ? err.message : "";
          if (!/not valid JSON/i.test(msg)) throw err;
        }
        setInfo("Email has been sent! Check your inbox.");
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await withAuthRetry(() =>
          auth.signIn(parsed.data.email, parsed.data.password),
        );
        // Auto-redirects on success
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(getFriendlyAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      const auth = await waitForApexAuth();
      if (!auth.signInWithGoogle) {
        throw new Error(
          "Google sign-in isn't available yet. Please use email instead.",
        );
      }
      signupInFlightRef.current = true;
      await withAuthRetry(() =>
        auth.signInWithGoogle!({ plan: planTier, period }),
      );
      // Auto-redirects: to Stripe checkout for a brand-new account with a
      // plan, or straight into the app for a returning Google user.
    } catch (err: unknown) {
      signupInFlightRef.current = false;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const friendly = getFriendlyAuthError(msg);
      if (friendly) setError(friendly);
    } finally {
      setGoogleLoading(false);
    }
  };

  const benefits = [
    {
      title: "3 free authorized suppliers",
      desc: "Vetted, authorized US wholesale distributors handed to you when your trial starts — skip months of cold outreach.",
    },
    {
      title: "White-glove onboarding",
      desc: "Included with your account: 160 minutes of Amazon education plus full software installation and setup.",
    },
    {
      title: "Dedicated account manager",
      desc: "Get direct access to a real person who understands your workflow and answers fast.",
    },
    {
      title: "ROI results in 30 Days",
      desc: "Our average operator sees measurable returns in the first month of use.",
    },
  ];

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : "Welcome back";
  const sub =
    mode === "signup"
      ? "Start your free trial today"
      : mode === "forgot"
        ? "We'll email you a reset link"
        : "Log in to your Apex dashboard";
  const cta =
    mode === "signup"
      ? "Start free trial"
      : mode === "forgot"
        ? "Send reset link"
        : "Log in";

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="pt-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
              The #1 Amazon Wholesale Software{" "}
              <span className="text-brand">All-In-One Suite</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-xl leading-relaxed">
              Apex Black, Blue & Green connect sourcing, purchasing, and profit
              tracking into one streamlined platform — so you can scale with
              clarity and speed.
            </p>

            <ul className="mt-10 space-y-6 max-w-lg">
              {benefits.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <CheckCircle2
                    className="w-6 h-6 text-brand flex-shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {b.title}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{b.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 max-w-lg bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-3">
                <img
                  src={michaelRAsset.url}
                  alt="Michael R."
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Michael R.
                  </div>
                  <div className="text-xs text-slate-500">
                    New Seller • 3 Months In
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-slate-600 leading-relaxed">
                "Apex replaced the scattered tools we were juggling and gave us
                one source of truth. The time savings alone paid for the
                subscription within the first month."
              </p>
            </div>
          </div>

          <div className="lg:pt-4">
            <motion.div
              ref={formCardRef}
              animate={{
                boxShadow: [
                  "0 40px 100px -30px rgba(15,23,42,0.18), 0 0 0 0 rgba(59,130,246,0)",
                  "0 40px 100px -30px rgba(15,23,42,0.18), 0 0 0 10px rgba(59,130,246,0.35)",
                  "0 40px 100px -30px rgba(15,23,42,0.18), 0 0 0 0 rgba(59,130,246,0)",
                ],
              }}
              transition={{ duration: 1.6, repeat: 1, ease: "easeInOut" }}
              className="bg-white rounded-[28px] border border-slate-200 p-8 sm:p-10 max-w-md mx-auto lg:ml-auto lg:mr-0 w-full"
            >
              {needsPayment ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
                    <CreditCard
                      className="w-6 h-6 text-amber-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                    One Step Left
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Your account is created, but your subscription hasn't been
                    activated yet because a payment method wasn't added. Reach
                    out to our team and we'll get you set up right away.
                  </p>
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center justify-center w-full bg-slate-900 text-white font-bold tracking-wide text-sm py-4 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Contact Us
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      const auth = await waitForApexAuth().catch(() => null);
                      await auth?.signOut();
                      setNeedsPayment(false);
                      setMode("login");
                    }}
                    className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                        mode === "login"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                        mode === "signup"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-slate-900 text-center">
                    {heading}
                  </h2>
                  <p className="text-sm text-slate-500 text-center mt-1 mb-8">
                    {sub}
                  </p>

                  {mode === "signup" && (
                    <div className="mb-6 text-center text-xs font-bold text-brand bg-brand/5 border border-brand/10 rounded-xl px-4 py-2.5">
                      Signing up for the {PLAN_TIER_LABELS[planTier]} plan —{" "}
                      {period === "yearly" ? "Annual" : "Monthly"} billing
                    </div>
                  )}

                  {mode !== "forgot" && (
                    <>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3.5 font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-60"
                      >
                        {googleLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <path
                              fill="#4285F4"
                              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.29 24 12 24Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.61H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
                            />
                          </svg>
                        )}
                        {googleLoading
                          ? "Please wait…"
                          : `${mode === "signup" ? "Sign up" : "Log in"} with Google`}
                      </button>

                      <div className="flex items-center gap-3 my-6">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          or
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                    </>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === "signup" && (
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-bold text-slate-700 mb-2"
                        >
                          Full name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            ref={firstFieldRef}
                            id="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (fieldErrors.name)
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  name: undefined,
                                }));
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("name", e.target.value)
                            }
                            aria-invalid={!!fieldErrors.name}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:ring-2 outline-none text-slate-900 ${
                              fieldErrors.name
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:border-brand focus:ring-brand/20"
                            }`}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        {fieldErrors.name && (
                          <p className="mt-1.5 text-xs font-medium text-red-600">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-bold text-slate-700 mb-2"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          ref={mode !== "signup" ? firstFieldRef : undefined}
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email)
                              setFieldErrors((prev) => ({
                                ...prev,
                                email: undefined,
                              }));
                          }}
                          onBlur={(e) =>
                            handleFieldBlur("email", e.target.value)
                          }
                          aria-invalid={!!fieldErrors.email}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:ring-2 outline-none text-slate-900 ${
                            fieldErrors.email
                              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:border-brand focus:ring-brand/20"
                          }`}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {mode !== "forgot" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor="password"
                            className="block text-sm font-bold text-slate-700"
                          >
                            Password
                          </label>
                          {mode === "login" && (
                            <button
                              type="button"
                              onClick={() => setMode("forgot")}
                              className="text-xs font-bold text-brand hover:underline"
                            >
                              Forgot?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={
                              mode === "signup"
                                ? "new-password"
                                : "current-password"
                            }
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (fieldErrors.password)
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  password: undefined,
                                }));
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("password", e.target.value)
                            }
                            aria-invalid={!!fieldErrors.password}
                            className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-white focus:ring-2 outline-none text-slate-900 ${
                              fieldErrors.password
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:border-brand focus:ring-brand/20"
                            }`}
                            placeholder="Your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {fieldErrors.password ? (
                          <p className="mt-1.5 text-xs font-medium text-red-600">
                            {fieldErrors.password}
                          </p>
                        ) : (
                          mode === "signup" && (
                            <p className="mt-1.5 text-xs text-slate-400">
                              At least 6 characters
                            </p>
                          )
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      Your data is secure and encrypted
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}
                    {info && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {info}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold tracking-wide text-sm py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" fill="currentColor" />
                      )}
                      {loading ? "Please wait…" : cta}
                    </button>
                  </form>

                  <p className="text-center text-sm text-slate-500 mt-6">
                    {mode === "signup" ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-brand font-bold hover:underline"
                        >
                          Sign in
                        </button>
                      </>
                    ) : mode === "forgot" ? (
                      <>
                        Remembered it?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-brand font-bold hover:underline"
                        >
                          Back to login
                        </button>
                      </>
                    ) : (
                      <>
                        New to Apex?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signup")}
                          className="text-brand font-bold hover:underline"
                        >
                          Sign up
                        </button>
                      </>
                    )}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Cancel anytime
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
