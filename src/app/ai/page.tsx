import type { Metadata } from "next";

import AgentInfrastructure from "../../components/AgentInfrastructure";

export const metadata: Metadata = {
  title: "Connect AI agents to your Amazon business | Apex Applications",
  description:
    "Apex gives Claude and other MCP-compatible AI agents read access to your Amazon wholesale data, under your own permissions. See what is live today and what is coming.",
  alternates: {
    canonical: "https://www.apexapplications.io/ai",
  },
};

export default function Page() {
  return <AgentInfrastructure />;
}
