import type { Metadata } from "next";

import HeroV2 from "../../components/landing/HeroV2";
import PricingV2 from "../../components/landing/PricingV2";
import ProofV2 from "../../components/landing/ProofV2";
import WedgeV2 from "../../components/landing/WedgeV2";
import SiteNavigation from "../../components/site/SiteNavigation";

export const metadata: Metadata = {
  title: "Apex Applications — Software and suppliers for Amazon wholesale",
  description:
    "The only platform built for Amazon wholesale: sourcing, purchasing and profit tracking, plus 389 vetted distributor accounts and 21 prep centres.",
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return (
    <>
      <SiteNavigation />
      <main>
        <HeroV2 />
        <ProofV2 />
        <WedgeV2 />
        <PricingV2 />
      </main>
    </>
  );
}
