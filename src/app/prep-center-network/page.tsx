import type { Metadata } from "next";
import PrepCenterNetwork from "../../components/PrepCenterNetwork";

export const metadata: Metadata = {
  title: "Prep Center Network — Apex Applications",
  description:
    "The Apex Prep Center Network: vetted prep centers across the US with member pricing, an onboarding guide, and a copy-ready outreach email template.",
};

export default function Page() {
  return <PrepCenterNetwork />;
}
