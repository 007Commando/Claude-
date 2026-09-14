import type { Metadata } from "next";
import ApexBlack from "../../../components/ApexBlack";

export const metadata: Metadata = {
  title: "Apex Black — Amazon Seller Dashboard & Review Automation",
  description:
    "The command center of the Apex Applications suite: your Amazon dashboard, automated Review Booster, and the Apex University education center.",
  alternates: { canonical: "https://www.apexapplications.io/features/black" },
};

export default function Page() {
  return <ApexBlack />;
}
