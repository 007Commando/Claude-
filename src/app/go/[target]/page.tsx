import type { Metadata } from "next";
import GoRedirect from "../../../components/GoRedirect";

/**
 * The nurture-v2 email sequence's link router (marketing/nurture-v2/03-plan.md,
 * "Links: one router, full attribution"). Every CTA points here as
 * /go/<target>?e=<EMAIL_ID> instead of straight at the app or a signup link,
 * so a click always records attribution and lands on the right app path (or
 * signup) whether or not the reader is already signed in. Never linked to
 * from the site itself -- it only ever exists as an email destination -- so
 * it stays out of the sitemap and out of search.
 */
export const metadata: Metadata = {
  title: "Opening Apex…",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ target: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { target } = await params;
  const sp = await searchParams;
  const rawEmailId = typeof sp.e === "string" ? sp.e : undefined;

  return <GoRedirect target={target} emailId={rawEmailId} />;
}
