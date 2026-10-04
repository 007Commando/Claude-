import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import PrepCenterNetwork from "../../components/PrepCenterNetwork";

export const metadata: Metadata = pageMetadata({
  title: "Prep Center Network for Amazon Sellers | Apex",
  description:
    "The Apex Prep Center Network: vetted prep centers across the US with member pricing, an onboarding guide and a copy-ready outreach email template.",
  path: "/prep-center-network",
});

export default function Page() {
  return <PrepCenterNetwork />;
}
