import type { Metadata } from "next";
import ApexBlack from "../../../components/ApexBlack";

export const metadata: Metadata = {
  title: "Apex Black — Amazon Wholesale Dashboard & Review Automation | Apex Applications",
  description:
    "The command center of the Apex Applications suite: your Amazon dashboard, automated Review Booster, and the Apex University education center.",
  alternates: { canonical: "https://apexapplications.io/features/black" },
};

export default function Page() {
  return <ApexBlack />;
}
