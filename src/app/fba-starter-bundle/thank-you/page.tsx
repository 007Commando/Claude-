import type { Metadata } from "next";
import FbaThankYou from "../../../components/FbaThankYou";

export const metadata: Metadata = {
  title: "You're In | Apex Applications",
  description: "Welcome to Apex. Join the Circle Community and schedule your 1-on-1 onboarding call.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FbaThankYou />;
}
