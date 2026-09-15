import type { Metadata } from "next";
import PrivacyPolicy from "../../components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy, Apex Applications",
  description:
    "How Apex Applications collects, uses, and protects your data, including SMS communications and mobile information practices.",
  alternates: { canonical: "https://www.apexapplications.io/privacy" },
};

export default function Page() {
  return <PrivacyPolicy />;
}
