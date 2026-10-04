import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ApexBlack from "../../../components/ApexBlack";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Review Request Automation | Apex Black",
  description:
    "Send Amazon's Request a Review on every eligible order automatically, on a schedule, with a log of what was sent. Plus your dashboard and Apex University.",
  path: "/features/black",
});

export default function Page() {
  return <ApexBlack />;
}
