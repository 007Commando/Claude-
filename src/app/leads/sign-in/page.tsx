import type { Metadata } from "next";
import { signIn } from "../../../auth";
import "../leadDesk.css";

export const metadata: Metadata = {
  title: "Sign in — Lead Desk",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  "not-invited": "This Google account is not on the invite list. Ask Stefano to add your email.",
  AccessDenied: "This Google account is not on the invite list. Ask Stefano to add your email.",
};

function errorMessage(error: string | undefined): string | null {
  if (!error) return null;
  return ERROR_MESSAGES[error] ?? "Sign-in failed, try again.";
}

export default async function LeadsSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const message = errorMessage(error);
  const target = callbackUrl && callbackUrl.startsWith("/leads") ? callbackUrl : "/leads";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: target });
  }

  return (
    <div className="lead-desk ld-signin-page">
      <div className="ld-signin-card">
        <div className="ld-signin-title">Lead Desk</div>
        <div className="ld-signin-sub">Sign in with an invited Google account.</div>
        {message && <div className="ld-signin-error">{message}</div>}
        <form action={signInWithGoogle}>
          <button type="submit" className="ld-btn ld-btn-primary ld-signin-btn">
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
