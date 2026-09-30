import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedEmail } from "./lib/leadDesk/allowedEmails";

/**
 * Google sign-in for the internal Lead Desk CRM (/leads, /api/leads/**).
 * JWT sessions, no database — the only "membership" concept is the
 * LEAD_DESK_ALLOWED_EMAILS allow list checked in the signIn callback below.
 *
 * /dashboard keeps its own separate HTTP Basic Auth (see src/middleware.ts);
 * this file has nothing to do with that.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/leads/sign-in",
  },
  callbacks: {
    async signIn({ profile }) {
      const email = typeof profile?.email === "string" ? profile.email.toLowerCase() : null;
      const emailVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified === true;

      if (!email || !emailVerified) return false;
      if (!isAllowedEmail(email)) return "/leads/sign-in?error=not-invited";
      return true;
    },
    async jwt({ token, profile }) {
      if (profile) {
        if (typeof profile.email === "string") token.email = profile.email;
        if (typeof profile.name === "string") token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.email === "string") session.user.email = token.email;
      if (typeof token.name === "string") session.user.name = token.name;
      return session;
    },
  },
});
