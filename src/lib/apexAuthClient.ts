"use client";

import type { MouseEvent } from "react";

const APP_ORIGIN = "https://app.apexapplications.io";

/**
 * Whether the person clicking a buy button already has an Apex account.
 *
 * This exists because of a real double charge. Every purchase CTA on this site
 * points straight at Stripe, and a Stripe checkout reached that way builds a
 * brand-new customer out of whatever email is typed into it. A seller already
 * mid-trial bought a second plan, typed their address one letter short, and
 * ended up with two customers, two subscriptions and two bills with nothing
 * connecting them. Somebody who already has a subscription should be changing
 * it in the app, where their customer is already known.
 *
 * Deliberately decided at click time rather than on render. The answer comes
 * from a script served by another origin, so on a slow connection a render-time
 * check is still "don't know" while the button is already clickable -- and a
 * buy button that waits on a third-party script is a worse problem than the one
 * being fixed.
 */
export async function getSignedInUser(): Promise<{ email: string | null } | null> {
  const auth = window.ApexAuth;
  if (!auth?.getCurrentUser) return null;
  try {
    const user = (await auth.getCurrentUser()) as { email?: string | null } | null;
    return user ? { email: user.email ?? null } : null;
  } catch {
    return null;
  }
}

/**
 * The answer, worked out once on load rather than once per click.
 *
 * Without this a signed-out visitor -- which is most of them -- still had
 * their click swallowed and replayed from script, which quietly turned these
 * CTAs from "open Stripe in a new tab" into "leave this page". The check was
 * only ever meant to change what happens to people who already have an
 * account; everyone else should get the link exactly as it was written.
 *
 * `undefined` means the answer has not arrived, and only then does a click
 * pay the cost of waiting.
 */
let cachedUser: { email: string | null } | null | undefined;

if (typeof window !== "undefined") {
  const started = Date.now();
  const prime = () => {
    const auth = window.ApexAuth;
    /**
     * Subscribed, not sampled.
     *
     * Asking getCurrentUser() once on load looks equivalent and is not: it
     * answers before Firebase has restored the session from storage, so a
     * signed-in customer is recorded as a visitor and stays recorded that way
     * for the life of the page. Tested against a real signed-in session, that
     * is exactly what happened. The listener gives the settled answer, and
     * keeps giving it if they sign in or out while reading.
     */
    if (auth?.onAuthStateChanged) {
      Promise.resolve(
        auth.onAuthStateChanged((user) => {
          const account = user as { email?: string | null } | null;
          cachedUser = account ? { email: account.email ?? null } : null;
        }),
      ).catch(() => {
        cachedUser = null;
      });
      return;
    }
    // No script after the same grace period a click would allow: treat the
    // reader as a visitor, which is what they almost certainly are.
    if (Date.now() - started > 8000) {
      cachedUser = null;
      return;
    }
    setTimeout(prime, 100);
  };
  prime();
}

const goToApp = (path: string) => {
  const auth = window.ApexAuth;
  if (auth?.redirectToApp) auth.redirectToApp(path);
  else window.location.assign(`${APP_ORIGIN}${path}`);
};

const withEmail = (href: string, param: string, email: string) =>
  `${href}${href.includes("?") ? "&" : "?"}${param}=${encodeURIComponent(email)}`;

/** A modified click is the reader opening a tab themselves; leave it alone. */
const isPlainClick = (event: MouseEvent<HTMLAnchorElement>) =>
  !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;

/**
 * Sends an existing customer to the app instead of to Stripe.
 *
 * Every path out of here ends in a navigation, including every failure: no
 * auth script, a rejected promise, or an answer that never arrives all fall
 * through to the Stripe link the button already had. A buyer must never be
 * left on a page where the button did nothing.
 */
export function interceptForSignedIn(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  path = "/subscriptions",
) {
  if (!isPlainClick(event)) return;
  if (!window.ApexAuth?.getCurrentUser) return;
  // Known to be a visitor: leave the link completely alone, target and all.
  if (cachedUser === null) return;

  event.preventDefault();

  if (cachedUser) {
    goToApp(path);
    return;
  }

  let settled = false;
  const fallback = () => {
    if (settled) return;
    settled = true;
    window.location.assign(href);
  };
  // A slow answer must not cost the sale.
  const timer = setTimeout(fallback, 1500);

  getSignedInUser().then((user) => {
    clearTimeout(timer);
    if (settled) return;
    settled = true;
    if (user) goToApp(path);
    else window.location.assign(href);
  });
}

/**
 * For things the app cannot sell.
 *
 * Apex Elite and Premium Membership are products, not plans -- there is no
 * page inside the app that buys them, so redirecting a signed-in customer to
 * their subscriptions would take away the only way to buy at all. They still
 * go to Stripe, but carrying the address their account already uses, so
 * checkout attaches to the customer they have instead of inventing one out of
 * whatever they retype.
 *
 * `param` differs by destination: a Stripe payment link reads
 * `prefilled_email`, while our own checkout route reads a plain `email` and
 * resolves the customer itself.
 */
export function interceptWithEmail(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  param = "prefilled_email",
) {
  if (!isPlainClick(event)) return;
  if (!window.ApexAuth?.getCurrentUser) return;
  if (cachedUser === null) return;

  event.preventDefault();

  if (cachedUser?.email) {
    window.location.assign(withEmail(href, param, cachedUser.email));
    return;
  }

  let settled = false;
  const go = (url: string) => {
    if (settled) return;
    settled = true;
    window.location.assign(url);
  };
  const timer = setTimeout(() => go(href), 1500);

  getSignedInUser().then((user) => {
    clearTimeout(timer);
    go(user?.email ? withEmail(href, param, user.email) : href);
  });
}
