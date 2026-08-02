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

// Fails open (treats the user as subscribed) on any network or server error —
// a Stripe or API hiccup must never lock out an already-paying customer. The
// real protection is failing closed on a clean "no active subscription"
// response, which is the actual reported failure mode (account created,
// checkout abandoned, no card on file).
export async function hasActiveSubscription(email: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/check-subscription?email=${encodeURIComponent(email)}`);
    if (!res.ok) return true;
    const data = (await res.json()) as { hasActiveSubscription?: boolean };
    return data.hasActiveSubscription !== false;
  } catch {
    return true;
  }
}
