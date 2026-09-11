import type { Metadata } from "next";
import ApexVas from "../../components/ApexVas";

export const metadata: Metadata = {
  title: "Apex VAs — Trained Amazon Virtual Assistants | Apex Applications",
  description:
    "Hire a trained Amazon wholesale VA who works inside your Apex account. Part-time from $7/hour, full-time from $5.50/hour, 5% off paid quarterly.",
  alternates: { canonical: "https://apexapplications.io/apex-vas" },
  // Footer-only for now: keep it out of search until the service launches wide.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ApexVas />;
}
