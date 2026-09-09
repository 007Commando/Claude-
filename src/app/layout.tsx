import type { Metadata } from "next";
import Script from "next/script";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HashScrollHandler from "../components/HashScrollHandler";
import LeadAttribution from "../components/LeadAttribution";
import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import "../index.css";

const SITE_URL = "https://apexapplications.io";

const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/72d97ab6-3399-4642-9df9-825e9c60a21b/id-preview-bdd3505f--6faac52a-fe63-48e8-95e5-619fb0da6fb7.lovable.app-1782857715383.png";

export const metadata: Metadata = {
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
  alternates: {
    canonical: "https://apexapplications.io/",
  },
  openGraph: {
    type: "website",
    siteName: "Apex Applications",
    title: "Apex Applications — Amazon Wholesale Software Suite",
    description:
      "Sourcing, vendors, P&L, purchase orders, and review automation — all in one Amazon wholesale suite.",
    url: "https://apexapplications.io/",
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

// One SoftwareApplication entity for the whole suite (Apex Black, Blue, Green,
// Red) rather than four separate listings — they're sold and trialed together
// as a single subscription, not standalone products.
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Apex Applications",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "All-in-one Amazon wholesale software suite: sourcing, vendor management, purchase orders, P&L analytics, logistics, and automated review generation.",
  url: SITE_URL,
  offers: [
    {
      "@type": "Offer",
      name: "Starter Plan",
      price: "149.99",
      priceCurrency: "USD",
      category: "subscription",
      url: `${SITE_URL}/pricing`,
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "299",
      priceCurrency: "USD",
      category: "subscription",
      url: `${SITE_URL}/pricing`,
    },
  ],
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
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
