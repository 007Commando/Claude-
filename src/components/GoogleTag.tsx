"use client";

import { useEffect } from "react";
import Script from "next/script";

import { CONVERSIONS, type ConversionName } from "../config/conversions";

/**
 * gtag.js, for GA4 and Google Ads.
 *
 * The site carried a Meta pixel, an OpenAI pixel and the GHL tracker, and no
 * Google tag at all. That is survivable right up until the moment money goes
 * into Google Ads, at which point it means the account cannot count a
 * conversion, cannot build a remarketing list, and cannot use Smart Bidding,
 * because all three are the same tag.
 *
 * Both ids come from the environment and either may be absent. With neither
 * set this component renders nothing at all, which is deliberate: the tag
 * ships before the Google Ads account exists, so turning it on later is
 * pasting one variable into Vercel rather than a deploy.
 *
 *   NEXT_PUBLIC_GA4_ID          G-XXXXXXXXXX
 *   NEXT_PUBLIC_GOOGLE_ADS_ID   AW-XXXXXXXXX
 *
 * `allow_enhanced_conversions` is on. It lets a conversion carry a hashed
 * email, which is what recovers the attribution Safari's cookie policy
 * otherwise throws away. Nothing unhashed leaves the browser; gtag hashes it
 * before it sends.
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function GoogleTag() {
  useBookingClicks();

  const primary = GA4_ID ?? ADS_ID;
  if (!primary) return null;

  const configs = [
    GA4_ID ? `gtag('config', '${GA4_ID}');` : "",
    ADS_ID
      ? `gtag('config', '${ADS_ID}', { allow_enhanced_conversions: true });`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configs}`}
      </Script>
    </>
  );
}

/**
 * Report one of the site's conversions to Google Ads.
 *
 * Takes the conversion's name rather than its label, so call sites read as
 * what happened rather than as an opaque Google identifier, and so the value
 * attached to each one lives in a single file next to the others.
 *
 * Silently does nothing when the tag is absent or the label is not configured,
 * which is every environment until the Google Ads account exists. A call site
 * never has to check first, and none of them do.
 *
 * `email` is passed for enhanced conversions and is hashed by gtag before it
 * leaves the browser. Pass it where the address is already known, which is any
 * point after the signup form. Never invent one.
 */
export function trackConversion(
  name: ConversionName,
  opts: { transactionId?: string; email?: string; value?: number } = {},
): void {
  if (typeof window === "undefined" || !ADS_ID) return;
  const spec = CONVERSIONS[name];
  if (!spec.label) return;

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  if (opts.email) {
    gtag("set", "user_data", { email: opts.email });
  }
  gtag("event", "conversion", {
    send_to: `${ADS_ID}/${spec.label}`,
    value: opts.value ?? spec.value,
    currency: "USD",
    ...(opts.transactionId ? { transaction_id: opts.transactionId } : {}),
  });
}

/**
 * A booking is a click away from the site, not an event on it.
 *
 * Every "book a call" control on the programme pages is an ordinary link to
 * Calendly, in seven different components, and the booking itself completes on
 * Calendly's domain where no tag of ours runs. Rather than edit seven
 * components to report the same thing, this listens once for a click on
 * anything pointing at Calendly.
 *
 * What it counts is therefore the intent, not the booking: somebody left for
 * the booking page. The confirmed booking already arrives through Calendly's
 * API in lib/dashboard/calendly.ts, and that is the one to import offline as
 * the real conversion. Counting the click as though it were the meeting would
 * be measuring the easy half.
 */
function useBookingClicks(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      // A malformed or non-navigational href must not throw out of a
      // capture-phase click listener: everything downstream of it, including
      // the click the visitor actually made, would stop working.
      let host: string;
      try {
        host = new URL(anchor.href, window.location.href).hostname;
      } catch {
        return;
      }
      if (!/(^|\.)calendly\.com$/.test(host)) return;
      trackConversion("booking");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
}
