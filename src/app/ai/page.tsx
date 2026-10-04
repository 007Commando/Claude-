import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";

import AgentInfrastructure from "../../components/AgentInfrastructure";

export const metadata: Metadata = pageMetadata({
  title: "Connect AI Agents to Your Amazon Business | Apex",
  description:
    "Apex gives Claude and other MCP-compatible AI agents read access to your Amazon wholesale data, under your own permissions. See what is live and next.",
  path: "/ai",
});

export default function Page() {
  return <AgentInfrastructure />;
}
