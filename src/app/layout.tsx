import type { Metadata } from "next";
import Script from "next/script";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HashScrollHandler from "../components/HashScrollHandler";
import LeadAttribution from "../components/LeadAttribution";
import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import { SITE_URL } from "../config/site";
import "../index.css";

const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/72d97ab6-3399-4642-9df9-825e9c60a21b/id-preview-bdd3505f--6faac52a-fe63-48e8-95e5-619fb0da6fb7.lovable.app-1782857715383.png";

export const metadata: Metadata = {
  /**
   * Without this every relative URL in a page's metadata resolves against
   * whatever host Next guesses at build time. Setting it once means a page can
   * write `alternates: { canonical: "/pricing" }` and get the right absolute
   * URL, instead of each page hand-writing the host and one of them getting it
   * wrong — which is how the whole site ended up canonicalising to a domain
   * that redirects.
   */
  metadataBase: new URL(SITE_URL),
  title: "Apex Applications — Amazon Wholesale Software Suite",
  description:
    "Apex Applications is the all-in-one Amazon wholesale suite: sourcing, vendor management, P&L analytics, purchase orders, and review automation. Built for serious sellers.",
  keywords: [
    "Amazon wholesale software",
    "Amazon sourcing tool",
    "Amazon FBA analytics",
    "purchase order software",
    "Amazon review automation",
    "Apex Applications",
  ],
  authors: [{ name: "Apex Applications" }],
  /**
   * No canonical here on purpose. A canonical in the root layout is inherited
   * by every page that does not set its own, so a new page added without one
   * would quietly declare itself a duplicate of the homepage — telling Google
   * not to index it at all. The homepage sets its own in app/page.tsx; a page
   * that forgets now simply self-canonicalises, which is the right default.
   */
  openGraph: {
    type: "website",
    siteName: "Apex Applications",
    title: "Apex Applications — Amazon Wholesale Software Suite",
    description:
      "Sourcing, vendors, P&L, purchase orders, and review automation — all in one Amazon wholesale suite.",
    url: "https://www.apexapplications.io/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Applications — Amazon Wholesale Software Suite",
    description:
      "Sourcing, vendors, P&L, purchase orders, and review automation — all in one Amazon wholesale suite.",
    images: [OG_IMAGE],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Apex Applications",
  url: SITE_URL,
  logo: `${SITE_URL}${apexBullLogo.url}`,
  description:
    "All-in-one Amazon wholesale software suite for sourcing, analytics, purchase orders, and review automation.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Apex Applications",
  url: SITE_URL,
  description:
    "Apex Applications is the all-in-one Amazon wholesale suite: sourcing, vendor management, P&L analytics, purchase orders, and review automation.",
  publisher: { "@type": "Organization", name: "Apex Applications" },
};

/**
 * The SoftwareApplication block used to live here, in the root layout, which
 * put a product listing with two priced offers on every route the site has —
 * all 26 blog posts, the sign-in page, the sign-out page, the checkout, the
 * privacy policy and the terms. That is what the audit counted as 50 invalid
 * software-app items: one block in the wrong place, multiplied by the routes.
 *
 * It now lives on /pricing alone, which is the page it actually describes and
 * the only page where an offer is in context. Organization and WebSite stay
 * global, because those genuinely are facts about every page.
 *
 * Google also wants a rating or review before it will show a software-app rich
 * result. We have no review system and no permission to quote anyone, so the
 * markup stays truthful and simply is not eligible for that rich result. An
 * invented five-star score would fix the warning and be a lie.
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Signing in touches four origins in sequence — the auth script, the
          Firebase SDK, the identity API, then the app itself. Warming the
          connections here means the handshake for each is already done when
          the user clicks, rather than being paid mid-login.

          crossOrigin matters and is not cosmetic: a hint must match the mode
          of the request it is warming, or the browser opens a second
          connection and the hint buys nothing. The first two are fetched as
          plain scripts (no CORS); the googleapis endpoints are fetched by the
          Firebase SDK with CORS.
        */}
        <link rel="preconnect" href="https://app.apexapplications.io" />
        <link rel="preconnect" href="https://www.gstatic.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" crossOrigin="" />
        {/*
          apex-auth.js is loaded below by next/script as afterInteractive, so
          without this its fetch waits for hydration. No crossOrigin, to match
          that plain script tag — the origin sends no Access-Control-Allow-Origin,
          so a CORS-mode preload would simply fail.
        */}
        <link
          rel="preload"
          as="script"
          href="https://app.apexapplications.io/apex-auth.js"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script src="https://app.apexapplications.io/apex-auth.js" strategy="afterInteractive" />
        <Script
          src="https://link.msgsndr.com/js/external-tracking.js"
          data-tracking-id="tk_38b71d0c9c964a29938c819ffce85afa"
          strategy="afterInteractive"
        />
        <Script id="oaiq-pixel" strategy="afterInteractive">
          {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"8iBamdbpfEKYXHWyzY5p8i",debug:true});`}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2587560145358706');fbq('track','PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2587560145358706&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <div className="min-h-screen bg-white">
          <Navigation />
          <HashScrollHandler />
          <LeadAttribution />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
