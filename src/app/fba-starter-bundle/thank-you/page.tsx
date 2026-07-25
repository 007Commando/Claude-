import type { Metadata } from "next";
import FbaThankYou from "../../../components/FbaThankYou";

export const metadata: Metadata = {
  title: "You're In | Apex Applications",
  description: "Welcome to Apex. Schedule your 1-on-1 onboarding call for free roadmap assistance.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FbaThankYou />;
}
