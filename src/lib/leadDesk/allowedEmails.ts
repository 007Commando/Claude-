/**
 * The invite list for Lead Desk's Google sign-in. There is no database for
 * this — the allow list lives entirely in the LEAD_DESK_ALLOWED_EMAILS env
 * var (comma-separated, case-insensitive). The first address in the list is
 * treated as the owner (Stefano): only that account sees the Invite popover
 * in the top bar.
 */
export function getAllowedEmails(): string[] {
  const raw = process.env.LEAD_DESK_ALLOWED_EMAILS?.trim();
  const source = raw && raw.length > 0 ? raw : "info@apexapplications.io";
  const emails = source
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return emails.length > 0 ? emails : ["info@apexapplications.io"];
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedEmails().includes(email.toLowerCase());
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const [owner] = getAllowedEmails();
  return owner === email.toLowerCase();
}

export interface TeamMember {
  email: string;
  name: string;
}

/**
 * Everyone on the allow list but the owner, for the owner's "View as"
 * switch. Display names come from LEAD_DESK_MEMBER_NAMES
 * ("email:Name,email:Name"), since a member's Google name is only known
 * once they sign in; without one the address's local part is shown.
 */
export function getTeamMembers(): TeamMember[] {
  const names = new Map<string, string>();
  for (const pair of (process.env.LEAD_DESK_MEMBER_NAMES ?? "").split(",")) {
    const i = pair.indexOf(":");
    if (i > 0) names.set(pair.slice(0, i).trim().toLowerCase(), pair.slice(i + 1).trim());
  }
  const [, ...members] = getAllowedEmails();
  return members.map((email) => ({ email, name: names.get(email) || email.split("@")[0] }));
}
