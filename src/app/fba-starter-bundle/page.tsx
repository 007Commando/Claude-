import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import FbaStarterBundle from "../../components/FbaStarterBundle";

export const metadata: Metadata = pageMetadata({
  title: "Amazon FBA Starter Bundle for $29 | Apex",
  description:
    "Get the Amazon FBA Starter Bundle for $29: an extended trial of the Apex suite, 3 free suppliers, a free lifetime Review Booster and the Keepa Playbook.",
  path: "/fba-starter-bundle",
});

export default function Page() {
  return <FbaStarterBundle />;
}
