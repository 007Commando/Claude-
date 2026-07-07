import type { Metadata } from "next";
import Script from "next/script";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HashScrollHandler from "../components/HashScrollHandler";
import "../index.css";

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
  url: "https://apexapplications.io",
  description:
    "All-in-one Amazon wholesale software suite for sourcing, analytics, purchase orders, and review automation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script src="https://app.apexapplications.io/apex-auth.js" strategy="afterInteractive" />
        <div className="min-h-screen bg-white">
          <Navigation />
          <HashScrollHandler />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
