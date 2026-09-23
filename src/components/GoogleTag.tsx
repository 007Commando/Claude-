"use client";

import Script from "next/script";

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
 * Report a conversion to Google Ads.
 *
 * Call sites pass the label from the conversion action, not the action's name:
 * Google identifies it as `AW-XXXXXXXXX/labelGoesHere` and the label is the
 * only half that is unique. Silently does nothing when the tag is absent, so
 * a call site never has to check first.
 *
 * `email` is passed for enhanced conversions and is hashed by gtag before it
 * is sent. Pass it where the address is already known, which is any point
 * after the signup form; never invent one.
 */
export function reportConversion(
  label: string,
  opts: { value?: number; currency?: string; transactionId?: string; email?: string } = {},
): void {
  if (typeof window === "undefined" || !ADS_ID) return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  if (opts.email) {
    gtag("set", "user_data", { email: opts.email });
  }
  gtag("event", "conversion", {
    send_to: `${ADS_ID}/${label}`,
    ...(opts.value !== undefined ? { value: opts.value } : {}),
    currency: opts.currency ?? "USD",
    ...(opts.transactionId ? { transaction_id: opts.transactionId } : {}),
  });
}
