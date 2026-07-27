import type { Metadata } from "next";
import FbaStarterBundle from "../../components/FbaStarterBundle";

export const metadata: Metadata = {
  title: "Amazon FBA Starter Bundle, $29 | Apex Applications",
  description:
    "Get the Amazon FBA Starter Bundle for $29: an extended trial to the #1 Amazon reselling suite, 3 free suppliers, free lifetime Review Booster, the Keepa Playbook, and 9 core wholesale modules.",
  alternates: { canonical: "https://apexapplications.io/fba-starter-bundle" },
};

export default function Page() {
  return <FbaStarterBundle />;
}
