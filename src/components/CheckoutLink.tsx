"use client";

import { ReactNode } from "react";

import { interceptForSignedIn, interceptWithEmail } from "../lib/apexAuthClient";

/**
 * A buy button that checks whether you already have an account.
 *
 * Signed out it is an ordinary link to Stripe and behaves exactly as before.
 * Signed in it goes to the app's subscription page, because somebody with a
 * subscription should be changing it rather than buying a second one from a
 * sales page -- that is how one seller ended up paying for a trial and a
 * quarterly plan at once, on two Stripe customers differing by a single
 * character of email.
 *
 * The Stripe URL stays in `href` rather than being swapped out, so the link
 * still has a destination if the auth script is slow, blocked or broken, and
 * middle-click still opens what it looks like it opens.
 */
export default function CheckoutLink({
  href,
  className,
  children,
  appPath = "/subscriptions",
  newTab = false,
  onClick,
  mode = "app",
  emailParam,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  /** Where a signed-in customer is sent instead, in "app" mode. */
  appPath?: string;
  newTab?: boolean;
  onClick?: () => void;
  /**
   * "app" for a plan the app can already change -- buying it twice is the bug.
   * "prefill" for a product the app cannot sell, where the buyer still needs
   * Stripe but must arrive as the customer they already are.
   */
  mode?: "app" | "prefill";
  emailParam?: string;
}) {
  return (
    <a
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      onClick={(event) => {
        onClick?.();
        if (mode === "prefill") interceptWithEmail(event, href, emailParam);
        else interceptForSignedIn(event, href, appPath);
      }}
    >
      {children}
    </a>
  );
}
