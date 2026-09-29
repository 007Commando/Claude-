"use client";

import { useEffect, useMemo } from "react";
import { storeAttribution } from "./LeadAttribution";

const APP_ORIGIN = "https://app.apexapplications.io";
const MARKETING_AUTH_URL = "https://www.apexapplications.io/auth";

/**
 * Every nurture-v2 CTA (marketing/nurture-v2/03-plan.md, "Links: one router,
 * full attribution") points at /go/<target>?e=<EMAIL_ID> instead of a direct
 * app or signup link, so the destination can change per email without
 * touching GHL, and every click gets the same attribution a landing page
 * visit would.
 *
 * The app path a signed-in visitor is sent to for each target. An unknown
 * target (a typo in a template, a target retired after emails were already
 * sent) falls back to "open" rather than 404ing a customer out of an email.
 */
const TARGET_APP_PATHS: Record<string, string> = {
  trial: "/?start=trial",
  open: "/dashboard",
  scan: "/upc-scanner",
  suppliers: "/rewards/distributors",
  po: "/purchase-orders",
  restock: "/inventory",
  reviews: "/review-booster",
  repricing: "/strategy",
  pnl: "/opex",
  brands: "/brands",
  ungating: "/ungating",
  walkthrough: "/dashboard",
};

const DEFAULT_TARGET = "open";

/** GHL's EMAIL_ID shape, e.g. SELLER_09 or BEGINNER_13 -- see 02-tagging-system.md. */
const EMAIL_ID_RE = /^[A-Z]+_[0-9]{2}$/;

function resolveTarget(raw: string): string {
  return Object.prototype.hasOwnProperty.call(TARGET_APP_PATHS, raw) ? raw : DEFAULT_TARGET;
}

function resolveEmailId(raw: string | null | undefined): string | undefined {
  return raw && EMAIL_ID_RE.test(raw) ? raw : undefined;
}

function signedInUrl(target: string): string {
  return `${APP_ORIGIN}${TARGET_APP_PATHS[target]}`;
}

/**
 * Every other target signs an unknown visitor up free; only "trial" carries
 * them straight to the paid starter plan (the emails whose copy earns a
 * trial ask, per cta-map.json). Free signups drop the period param the same
 * way every other free signup link in this app does (see
 * PrimewellLeadForm's TRY_URL) -- there is no billing period to name.
 */
function signedOutUrl(target: string, emailId: string | undefined): string {
  const params = new URLSearchParams();
  params.set("mode", "signup");
  if (target === "trial") {
    params.set("plan", "starter");
    params.set("period", "monthly");
  } else {
    params.set("plan", "free");
  }
  params.set("utm_source", "nurture");
  params.set("utm_medium", "email");
  params.set("utm_campaign", "nurture-v2");
  if (emailId) params.set("utm_content", emailId);
  return `${MARKETING_AUTH_URL}?${params.toString()}`;
}

/**
 * Waits for apex-auth.js to finish loading (it's already on every marketing
 * page, see layout.tsx), then asks it who is signed in. Both steps get their
 * own short budget: a router link has to resolve fast, and a slow or absent
 * script is exactly the "don't know" case the plan calls for treating as
 * signed-out rather than stalling the redirect.
 */
function isSignedIn(): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const budgetMs = 3000;

    const withCurrentUser = (auth: NonNullable<Window["ApexAuth"]>) => {
      if (typeof auth.getCurrentUser !== "function") return resolve(false);
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }, budgetMs);
      Promise.resolve(auth.getCurrentUser())
        .then((user) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(!!user);
        })
        .catch(() => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(false);
        });
    };

    const tick = () => {
      if (window.ApexAuth) return withCurrentUser(window.ApexAuth);
      if (Date.now() - start > budgetMs) return resolve(false);
      setTimeout(tick, 100);
    };
    tick();
  });
}

interface GoRedirectProps {
  /** Raw path segment, not yet checked against the known target table. */
  target: string;
  /** Raw `e` query value, not yet checked against the EMAIL_ID shape. */
  emailId?: string;
}

export default function GoRedirect({ target: rawTarget, emailId: rawEmailId }: GoRedirectProps) {
  const target = useMemo(() => resolveTarget(rawTarget), [rawTarget]);
  const emailId = useMemo(() => resolveEmailId(rawEmailId), [rawEmailId]);
  // Computed up front so it also works as the no-JS fallback link below --
  // it needs neither ApexAuth nor an effect to be correct for a visitor we
  // cannot yet prove is signed in.
  const fallbackHref = useMemo(() => signedOutUrl(target, emailId), [target, emailId]);

  useEffect(() => {
    storeAttribution({
      source: "nurture",
      utmSource: "nurture",
      utmMedium: "email",
      utmCampaign: "nurture-v2",
      utmContent: emailId,
    });

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "nurture",
        event: "nurture_click",
        utmSource: "nurture",
        utmMedium: "email",
        utmCampaign: "nurture-v2",
        utmContent: emailId,
        target,
        url: window.location.href,
        referrer: document.referrer || undefined,
      }),
      keepalive: true,
    }).catch(() => {});

    let cancelled = false;
    isSignedIn().then((signedIn) => {
      if (cancelled) return;
      window.location.replace(signedIn ? signedInUrl(target) : fallbackHref);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, emailId, fallbackHref]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <p className="text-slate-500 text-sm font-medium">Opening Apex…</p>
      <a href={fallbackHref} className="text-sm text-blue-600 underline underline-offset-2">
        Continue to Apex
      </a>
    </main>
  );
}
