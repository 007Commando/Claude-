import { permanentRedirect } from "next/navigation";

/**
 * The VA promotion moved to /virtual-assistants, which is the canonical VA
 * URL: it is the one in the sitemap, the one the footer links to, and the one
 * search traffic arrives on.
 *
 * Redirected rather than deleted because this path has been linked from ads
 * and from the hire page, and two identical promotional pages is the thing
 * the split was meant to avoid. /apex-vas/hire is unaffected, since a
 * redirect here does not match its children.
 */
export default function Page() {
  // Permanent (308): the move is for good, and a temporary redirect keeps the old URL in the index.
  permanentRedirect("/virtual-assistants");
}
