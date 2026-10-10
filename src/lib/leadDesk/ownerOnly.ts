import { NextResponse } from "next/server";
import { auth } from "../../auth";
import { canSeeEmailsTab, isOwnerEmail } from "./allowedEmails";

/**
 * For the Lead Desk API routes only the owner may read: live traffic, ad
 * spend and results, and commissions. Team members (Aliza, the sales rep)
 * see the leads and the calls; hiding the other tabs in the UI is not enough
 * on its own, because the routes answer anyone signed in.
 *
 * Returns a 403 response to send back, or null when the caller is the owner.
 */
export async function ownerOnly(): Promise<NextResponse | null> {
  const session = await auth();
  if (isOwnerEmail(session?.user?.email)) return null;
  return NextResponse.json({ error: "Only the Lead Desk owner can see this" }, { status: 403 });
}

/** For the Emails tab's routes: the owner plus the team members named in canSeeEmailsTab. */
export async function emailsTabOnly(): Promise<NextResponse | null> {
  const session = await auth();
  if (canSeeEmailsTab(session?.user?.email)) return null;
  return NextResponse.json({ error: "The Emails tab isn't shared with this account" }, { status: 403 });
}
