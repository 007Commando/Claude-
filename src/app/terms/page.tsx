import type { Metadata } from "next";
import TermsOfService from "../../components/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service — Apex Applications",
  description: "The terms governing your use of the Apex Applications Amazon wholesale software suite.",
  alternates: { canonical: "https://apexapplications.io/terms" },
};

export default function Page() {
  return <TermsOfService />;
}
