import type { Metadata } from "next";
import SignOut from "../../../components/SignOut";

export const metadata: Metadata = {
  title: "Signing out — Apex Applications",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SignOut />;
}
