import type { Metadata } from "next";
import Proposal from "../../components/Proposal";
import { resolveAngle } from "../../lib/proposalAngles";

export const metadata: Metadata = {
  title: "Book a Call — Apex Applications",
  description:
    "See how Apex software and coaching help Amazon sellers find suppliers, get approved, and check the numbers — then book a free strategy call.",
  // Paid-traffic bridge page: keep it out of the organic index so it never
  // competes with the pages built to rank.
  robots: { index: false, follow: false },
};

// The angle is resolved server-side so the ad's variant arrives fully
// rendered — no blank shell before hydration on a paid click.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const single = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const angle = resolveAngle(single(params.angle), single(params.utm_content));
  return <Proposal angle={angle} />;
}
