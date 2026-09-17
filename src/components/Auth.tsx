"use client";

import { useEffect, useRef, useState } from "react";
import TrialTimeline from "./TrialTimeline";
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
  GraduationCap,
  ArrowRight,
  Star,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import michaelRAsset from "../assets/michael-r-avatar.png.asset.json";
import "./apex-surface.css";
import { TRIAL_CHECKOUT_URL } from "../config/offer";
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
      /**
       * Present only on builds that know about the card-first funnel. This
       * file is served from app.apexapplications.io and cached hard, so an
       * older copy has to keep working -- hence optional, and hence the
       * script reads the session id from the URL itself rather than waiting
       * to be handed one.
       */
      getPrepaidCheckout?: () => Promise<{
        email: string | null;
        hasSubscription: boolean;
        complete: boolean;
      } | null>;
      adoptPrepaidCheckout?: () => Promise<
        "adopted" | "duplicate" | "ignored" | null
      >;
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

  if (/an unknown error occurred/i.test(message)) {
    return "Something went wrong on our side. Please try again. If it keeps happening, email info@apexapplications.io and we'll set you up directly.";
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
    case "popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow popups for this site, or sign up with email below.";
    case "operation-not-allowed":
    case "unauthorized-domain":
    case "internal-error":
      return "Google sign-in isn't available right now. Please sign up with your email instead, it takes the same 30 seconds.";
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

// Where a signed-in user gets handed off to. The app sends people here with a
// redirect_uri when it needs a session, and someone who is already signed in
// must be handed straight back, otherwise they sit on this form staring at a
// login box while the app keeps bouncing them here — an endless loop.
function forwardToApp(
  auth: NonNullable<Window["ApexAuth"]>,
  fallbackPath = "/dashboard",
) {
  const redirect = new URL(window.location.href).searchParams.get(
    "redirect_uri",
  );
  if (redirect && auth.redirectBackToApp) {
    auth
      .redirectBackToApp(redirect)
      .catch(() => auth.redirectToApp(fallbackPath));
    return;
  }
  auth.redirectToApp(fallbackPath);
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

// What a plan-less account can actually use. Kept in words rather than feature
// flags because this is the one place a customer reads it.
const FREE_TIER = [
  "Apex University, the full Zero to Amazon Hero course",
  "Review Booster on eligible Amazon orders",
  "3 UPC scans to try the scanner on a real supplier list",
];

/**
 * Tell Meta a free account was created.
 *
 * Reported as Lead rather than CompleteRegistration on purpose. Stripe's
 * integration already sends CompleteRegistration through the Conversions API,
 * and it means something else there: a Stripe customer exists, which happens
 * at checkout. A free signup never reaches Stripe, so firing the same event
 * would merge two different things under one name and teach a campaign
 * optimising for paid trials to go looking for people who never pay.
 *
 * Without this the free arm of the course test reports nothing at all, while
 * the $29 arm reports a Purchase, and Ads Manager would show the paid page
 * winning by an infinite margin whatever actually happened.
 *
 * The eventID is carried so a server-side twin can be deduplicated against
 * this one later. There is no twin yet; adding the id now costs nothing and
 * means the browser event does not have to be found and changed when there is.
 */
function reportFreeSignup() {
  const eventId = `free-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.fbq?.(
    "track",
    "Lead",
    {
      content_name: "free_course_account",
      content_category: "free_account",
      currency: "USD",
      value: 0,
    },
    { eventID: eventId },
  );
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
  //
  // `?plan=free` is the one deliberate exception, and it has to be asked for
  // by name. ApexAuth.signUp takes plan optionally and drops a plan-less
  // signup into the app instead of checkout, which is how the free course and
  // Review Booster are reached — the app has always had a free-account state
  // (see the light lock and the three free scans), there was simply no way to
  // arrive in it from here.
  const planParam = params.get("plan");
  const isFreeSignup = planParam === "free";
  const planTier = PLAN_TIERS.find((p) => p === planParam) ?? "starter";
  const periodParam = params.get("period");
  const period = PERIODS.find((p) => p === periodParam) ?? "monthly";

  /**
   * The card-first arrival.
   *
   * The zero-to-hero CTA goes to Stripe first, so people reach this form with
   * a card already on file and `?session_id=cs_...` in the URL. Two things
   * change when that is true: the page stops promising a checkout that has
   * already happened, and the email field is filled from the session and
   * locked. That last part is not cosmetic -- the server only adopts a paid
   * session onto an account registering the same address, so a buyer who
   * typed a different one here would sign up with no subscription behind
   * their card and be asked to pay twice.
   */
  /** null until the auth listener has answered; nobody is redirected before. */
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const sessionIdParam = params.get("session_id");
  const [prepaidEmail, setPrepaidEmail] = useState<string | null>(null);
  const isPrepaid = !!sessionIdParam && /^cs_(test|live)_/.test(sessionIdParam);

  /**
   * A paid signup starts at the card, wherever it was started from.
   *
   * /zero-to-hero was rebuilt to send people to Stripe first, and it does —
   * but it is one page, and the site has a dozen other doors into this form:
   * the header's own Sign Up link, which renders on every page including that
   * one, every blog CTA, every comparison page, the landing page. All of them
   * carried `plan=starter` straight here, so people read the pitch, clicked
   * the nearest button, filled in the form and arrived inside the app with no
   * card on file — which is exactly what the change was meant to stop.
   *
   * Enforcing it here rather than link by link means a new CTA added next
   * month cannot reopen the hole by forgetting.
   *
   * Three exemptions, all deliberate. `plan=free` is the free course and has
   * never wanted a card. Someone returning from Stripe carries a session id
   * and must be allowed through, or this is a loop. And logging in is
   * untouched — this only ever fires on the signup tab.
   */
  const needsCardFirst =
    mode === "signup" &&
    !isFreeSignup &&
    !isPrepaid &&
    // Resolved, and nobody home. `null` means we have not heard yet, and a
    // redirect on a guess would pull a signed-in customer out to Stripe.
    signedIn === false &&
    params.get("switch") !== "1";

  useEffect(() => {
    if (!needsCardFirst) return;
    window.location.assign(TRIAL_CHECKOUT_URL);
  }, [needsCardFirst]);

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
  // Set when a signed-in user has no active Stripe subscription. That is a real
  // account on the free tier — Apex University, the Review Booster and three UPC
  // scans — not a broken signup, so instead of forwarding silently to a dashboard
  // full of locks, the card below says what they have and offers both doors:
  // into the course, or on to a plan.
  const [onFreePlan, setOnFreePlan] = useState(false);
  const [continuing, setContinuing] = useState(false);

  /**
   * Fill the email from the paid session as soon as the script can tell us.
   *
   * Failure here is deliberately quiet: an unreadable session leaves an
   * ordinary editable field rather than an error on a page someone has just
   * paid to reach. The server still refuses to adopt a mismatched address, so
   * the guarantee does not rest on this working.
   */
  useEffect(() => {
    if (!isPrepaid) return;
    let cancelled = false;

    waitForApexAuth()
      .then((auth) => auth.getPrepaidCheckout?.() ?? null)
      .then((prepaid) => {
        if (cancelled || !prepaid?.email) return;
        setPrepaidEmail(prepaid.email);
        setEmail(prepaid.email);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isPrepaid]);

  // The auth-state effect below runs once (deps: []), so it can't close over
  // isFreeSignup directly — a ref keeps the current value available to it.
  const freeSignupRef = useRef(isFreeSignup);
  freeSignupRef.current = isFreeSignup;

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
            /**
             * Recorded before the early returns below, because the card-first
             * redirect waits on this: it must not fire while the answer is
             * still unknown, or it would send an existing customer who is
             * merely signed in out to Stripe.
             */
            if (!cancelled) setSignedIn(!!user);
            if (!user || signupInFlightRef.current) return;
            // Arrived here specifically to change accounts: never auto-forward
            // on the session we are in the middle of clearing.
            if (suppressForwardRef.current) return;
            const userEmail = getAuthUserEmail(user);
            const sendToApp = () => forwardToApp(auth);

            if (!userEmail) {
              // Can't verify subscription status without an email to look up
              // — fall back to the previous behavior rather than block someone
              // we have no way to check.
              sendToApp();
              return;
            }

            // A plan-less free account is a legitimate end state, not a failed
            // checkout: the subscription gate below would flag it as an
            // unfinished payment and dead-end the free-course funnel. Only
            // ?plan=free takes this path, so paid signups are unaffected.
            if (freeSignupRef.current) {
              setOnFreePlan(false);
              sendToApp();
              return;
            }

            hasActiveSubscription(userEmail).then((subscribed) => {
              if (cancelled) return;
              if (subscribed) {
                setOnFreePlan(false);
                sendToApp();
              } else {
                setOnFreePlan(true);
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
            ...(isFreeSignup ? {} : {plan: planTier, period}),
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
        if (isFreeSignup) reportFreeSignup();
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
        /**
         * Someone who paid and turned out to already have an account signs in
         * here. Hold the redirect until the payment has been attached: once
         * the app has them, the session id is gone from the URL and the
         * charge has nowhere to land.
         */
        await withAuthRetry(() =>
          auth.signIn(parsed.data.email, parsed.data.password, {
            redirect: !isPrepaid,
          }),
        );
        if (isPrepaid) {
          const status = (await auth.adoptPrepaidCheckout?.()) ?? null;
          if (status === "duplicate") {
            setLoading(false);
            setInfo(
              "You already had a subscription, so we have not charged you twice — " +
                "the second payment is flagged for refund and support will confirm by email.",
            );
            return;
          }
          forwardToApp(auth);
        }
        // Auto-redirects on success
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      /**
       * Paid, then found out they already have an account. Being told to try
       * logging in is not enough here -- they have just been charged, so put
       * them on the login tab with their email still in the field and say
       * what happens next, rather than leaving them to work it out.
       */
      if (isPrepaid && /already (exists|in use)/i.test(msg)) {
        setModeOverride("login");
        setPassword("");
        setError(null);
        setInfo(
          "You already have an Apex account with this email. Log in and we'll " +
            "put the plan you just paid for onto it.",
        );
      } else {
        setError(getFriendlyAuthError(msg));
      }
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
        auth.signInWithGoogle!(isFreeSignup ? {} : { plan: planTier, period }),
      );
      /*
       * Only from the Sign Up tab. Google sign-in cannot tell us here whether
       * the account is new, so a returning free user who lands on Sign Up and
       * uses Google is counted again. That overcounts a little; reporting
       * nothing from the Google path would hide most free signups instead,
       * which costs the test far more than the noise does.
       */
      if (isFreeSignup && mode === "signup") reportFreeSignup();
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
      title: "3 vetted suppliers to start with",
      desc: "Authorized US wholesale distributors handed to you when your trial starts, so you skip months of cold outreach.",
    },
    {
      title: "White-glove onboarding",
      desc: "160 minutes of Amazon education with full software installation and setup, included with your account.",
    },
    {
      title: "A real account manager",
      desc: "Direct access to a person who knows your workflow and answers fast.",
    },
    {
      title: "Built to pay for itself",
      desc: "Sourcing, purchase orders and profit tracking in one place, so the hours you spend reconciling go back into buying.",
    },
  ];

  /**
   * Someone arriving from Stripe has already done the part this page used to
   * ask for, so promising them a free trial they have started reads as though
   * the payment did not register.
   */
  const heading =
    mode === "signup"
      ? isPrepaid
        ? "Finish setting up"
        : "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : "Welcome back";
  const sub =
    mode === "signup"
      ? isPrepaid
        ? "Your trial has started — this is the last step"
        : "Start your free trial today"
      : mode === "forgot"
        ? "We'll email you a reset link"
        : "Log in to your Apex dashboard";
  const cta =
    mode === "signup"
      ? isPrepaid
        ? "Create account"
        : "Start free trial"
      : mode === "forgot"
        ? "Send reset link"
        : "Log in";

  return (
    <section className="apex-surface relative min-h-screen overflow-hidden bg-background">
      <div className="mesh-bg pointer-events-none absolute inset-0 -z-0" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-20 lg:pt-28">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
          {/*
            Hidden on a phone, where it was a headline, a timeline, four
            benefits and a testimonial stacked above the form — so signing up
            began with a long scroll past things that had already done their
            job before the tap that got here. The pitch still runs alongside
            the form on a laptop, where it costs nothing.
          */}
          <div className="hidden pt-4 lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              {mode === "signup" ? "Apex Applications" : "Welcome back"}
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              The whole wholesale{" "}
              <span className="mt-3 inline-block -rotate-[1.5deg] bg-primary px-4 py-1.5 text-primary-foreground">
                business, in one place.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Apex Black, Blue and Green connect sourcing, purchasing and profit tracking into one
              workspace, so a supplier list becomes a purchase order without leaving the tab.
            </p>

            {mode === "signup" && !isFreeSignup && (
              <div className="mt-10 max-w-lg">
                <TrialTimeline plan={planTier} period={period} />
              </div>
            )}

            <ul className="mt-10 max-w-lg space-y-5">
              {benefits.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  </span>
                  <div>
                    <div className="text-base font-bold text-foreground">{b.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {b.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <figure
              className="mt-12 max-w-lg rounded-2xl border border-border bg-card p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex gap-0.5 text-accent">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground">
                "Apex replaced the scattered tools we were juggling and gave us one source of
                truth. The time savings alone paid for the subscription within the first month."
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <img
                  src={michaelRAsset.url}
                  alt=""
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-foreground">Michael R.</div>
                  <div className="text-xs text-muted-foreground">New seller, 3 months in</div>
                </div>
              </figcaption>
            </figure>
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
              className="glow-edge mx-auto w-full max-w-md rounded-3xl border bg-card p-6 sm:rounded-[28px] sm:p-10 lg:ml-auto lg:mr-0"
            >
              {onFreePlan ? (
                <div className="py-2">
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-5">
                    <GraduationCap
                      className="w-6 h-6 text-brand"
                      strokeWidth={2}
                    />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    You're on the free plan
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mt-2">
                    No subscription is attached to this account, so the free
                    tier is what's open:
                  </p>
                  <ul className="mt-5 space-y-3">
                    {FREE_TIER.map((item) => (
                      <li key={item} className="flex gap-3 items-start">
                        <CheckCircle2
                          className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span className="text-sm text-slate-600 leading-snug">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={continuing}
                    onClick={async () => {
                      setContinuing(true);
                      const auth = await waitForApexAuth().catch(() => null);
                      if (!auth) {
                        setContinuing(false);
                        setError("Auth service unavailable. Please refresh.");
                        return;
                      }
                      forwardToApp(auth, "/university");
                    }}
                    className="mt-7 inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold tracking-wide text-sm py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-60"
                  >
                    {continuing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Continue to Apex University
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-flex items-center justify-center w-full border border-slate-200 text-slate-700 font-bold tracking-wide text-sm py-4 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    See plans &amp; unlock everything
                  </Link>
                  <p className="mt-5 text-xs text-slate-400 leading-relaxed">
                    Expected a paid plan to be active?{" "}
                    <Link
                      href="/contact-us"
                      className="font-bold text-slate-500 hover:text-slate-700"
                    >
                      Contact us
                    </Link>{" "}
                    and we'll sort it out.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const auth = await waitForApexAuth().catch(() => null);
                      await auth?.signOut();
                      setOnFreePlan(false);
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
                      {isPrepaid ? (
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Card saved. Nothing else to pay — pick a password and you&apos;re in.
                        </span>
                      ) : isFreeSignup ? (
                        <>Free account, no card, no plan. Apex University and Review Booster included.</>
                      ) : (
                        <>
                          Signing up for the {PLAN_TIER_LABELS[planTier]} plan,{" "}
                          {period === "yearly" ? "annual" : "monthly"} billing
                        </>
                      )}
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
                          /**
                           * Locked to the address the card was paid with. The
                           * account only inherits that subscription when the
                           * two match, so an editable field here is a way to
                           * be charged and still land without a plan.
                           */
                          readOnly={mode === "signup" && !!prepaidEmail}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 outline-none text-slate-900 ${
                            mode === "signup" && prepaidEmail
                              ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                              : fieldErrors.email
                                ? "bg-white border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "bg-white border-slate-200 focus:border-brand focus:ring-brand/20"
                          }`}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      {mode === "signup" && prepaidEmail && (
                        <p className="mt-1.5 text-xs font-medium text-slate-500">
                          The email you paid with. Need a different one?{" "}
                          <a
                            href="mailto:support@apexapplications.io"
                            className="font-bold text-brand hover:underline"
                          >
                            Tell us
                          </a>{" "}
                          and we&apos;ll move it across.
                        </p>
                      )}
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold tracking-wide text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                      style={{ boxShadow: "0 6px 0 0 hsl(var(--primary) / 0.45)" }}
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
