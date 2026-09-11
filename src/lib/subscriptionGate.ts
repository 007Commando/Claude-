// Shared between Auth.tsx and ViewAppButton.tsx: both are entry points that
// can send an already-authenticated Firebase user straight into /dashboard.
// Neither used to check whether that user actually has a paid Stripe
// subscription, only whether ApexAuth considered them "signed in" — which
// let signups who abandoned the Stripe checkout step (never added a card)
// straight into the app. This closes that gap.

// ApexAuth's onAuthStateChanged hands back an untyped Firebase user object.
// Its real shape is never otherwise inspected in this codebase, so this
// narrows defensively instead of assuming a User type.
export function getAuthUserEmail(user: unknown): string | null {
  if (
    user &&
    typeof user === "object" &&
    "email" in user &&
    typeof (user as { email: unknown }).email === "string"
  ) {
    return (user as { email: string }).email;
  }
  return null;
}

/**
 * The account ids in the signed-in user's ID token claims.
 *
 * The email a customer logs in with and the email they typed at a Stripe
 * checkout are routinely different people-strings for the same person — a
 * work address at checkout, a gmail at signup — and an email-only
 * subscription check walls paying customers over the mismatch. Their token's
 * `accounts` claim and the subscription's `accountId` metadata name the same
 * thing exactly, so the check sends both.
 */
async function getClaimedAccountIds(): Promise<string[]> {
  try {
    const token = await window.ApexAuth?.getIdToken?.();
    if (typeof token !== "string") return [];
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { accounts?: { id?: unknown }[] };
    return (payload.accounts || [])
      .map((account) => account?.id)
      .filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id))
      .slice(0, 5);
  } catch {
    return [];
  }
}

// Fails open (treats the user as subscribed) on any network or server error —
// a Stripe or API hiccup must never lock out an already-paying customer. The
// real protection is failing closed on a clean "no active subscription"
// response, which is the actual reported failure mode (account created,
// checkout abandoned, no card on file).
export async function hasActiveSubscription(email: string): Promise<boolean> {
  try {
    const accounts = await getClaimedAccountIds();
    const params = new URLSearchParams({ email });
    if (accounts.length) params.set("accounts", accounts.join(","));
    const res = await fetch(`/api/check-subscription?${params.toString()}`);
    if (!res.ok) return true;
    const data = (await res.json()) as { hasActiveSubscription?: boolean };
    return data.hasActiveSubscription !== false;
  } catch {
    return true;
  }
}
