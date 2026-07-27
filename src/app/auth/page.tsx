import type { Metadata } from "next";
import { Suspense } from "react";
import Auth from "../../components/Auth";

export const metadata: Metadata = {
  title: "Log In or Sign Up — Apex Applications",
  description:
    "Log in to your Apex Applications dashboard, or start your 7-day free trial of the Amazon wholesale software suite.",
  alternates: { canonical: "https://apexapplications.io/auth" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Auth />
    </Suspense>
  );
}
