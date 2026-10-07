import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";

import AgentInfrastructure from "../../components/AgentInfrastructure";

export const metadata: Metadata = pageMetadata({
  title: "Connect ChatGPT and Claude to Your Amazon Business | Apex",
  description:
    "Connect Claude or ChatGPT to Apex and ask about your profit, stock, supplier scans and purchase orders. Reading works on every paid plan; draft purchase orders need Pro.",
  path: "/ai",
});

export default function Page() {
  return <AgentInfrastructure />;
}
