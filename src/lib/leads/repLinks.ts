/**
 * Yearly checkout links a sales rep sends from the lead drawer. The rep id is
 * a slug taken from the signed-in Lead Desk user; the signup page passes it
 * to ApexAuth, which records it on the Stripe subscription (metadata.rep).
 */

export type RepPlan = "plus" | "pro";

export const REP_SLUG_RE = /^[a-z0-9-]{2,32}$/;

/**
 * Where an existing account checks out inside the app, as a path on
 * app.apexapplications.io (it will take plan, period and rep as query
 * params). The format is not known yet, so this stays null and the drawer
 * shows only the signup links. Set it when the in-app route exists.
 */
export const APP_CHECKOUT_PATH: string | null = null as string | null;

export const REP_PLAN_LABELS: Record<RepPlan, string> = { plus: "Plus yearly", pro: "Pro yearly" };

/** A rep id from a display name: first name, lowercased, plain a-z, 0-9 and hyphens. Empty when nothing usable is left. */
export function repSlug(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  const slug = first
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 32);
  return REP_SLUG_RE.test(slug) ? slug : "";
}

export function signupLink(plan: RepPlan, rep: string): string {
  return `https://www.apexapplications.io/auth?mode=signup&plan=${plan}&period=yearly&rep=${rep}`;
}

/** The in-app checkout link for someone who already has an account, or null until APP_CHECKOUT_PATH is set. */
export function appCheckoutLink(plan: RepPlan, rep: string): string | null {
  if (!APP_CHECKOUT_PATH) return null;
  return `https://app.apexapplications.io${APP_CHECKOUT_PATH}?plan=${plan}&period=yearly&rep=${rep}`;
}
