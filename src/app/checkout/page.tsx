import type { Metadata } from "next";

import Checkout from "../../components/Checkout";

export const metadata: Metadata = {
  title: "Start Your Free Trial — Apex Applications",
  description:
    "Start your 7-day Apex free trial. Nothing is charged today and you can cancel any time before the trial ends.",
  // A live checkout session belongs to one buyer; nothing here should rank.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Checkout />;
}
