/**
 * The email a sales rep sends from Lead Desk in one click: the $1 week offer
 * and Stefano's booking link (Stefano, 2026-10-09: "use my calendly and the
 * $1 week offer"). Written as a short note from the rep, text-first like the
 * quiz email (quizEmail.ts), because a plain note from a person reads better
 * to this audience than a designed one. No em dashes (house style).
 *
 * Pure: the drawer imports it to show the exact preview, and the action
 * route imports it to send, so what the rep sees is what the lead gets.
 * Only Plus features are named; the repricer is Pro, so it is left out.
 */
import { DOLLAR_WEEK } from "../../config/offer";

export const BOOKING_LINK = "https://calendly.com/apexapplications-info/new-meeting";

export const DEFAULT_OFFER_INTRO = "Thanks for taking the time to talk today. Here's the offer I mentioned.";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function offerSignupLink(): string {
  return (
    `https://www.apexapplications.io/auth?mode=signup&plan=${DOLLAR_WEEK.plan}&period=${DOLLAR_WEEK.period}` +
    `&offer=${DOLLAR_WEEK.offer}&utm_source=ghl&utm_medium=email&utm_campaign=sales-rep&utm_content=dollar-week-offer`
  );
}

export function offerEmail(opts: {
  firstName: string;
  repName: string;
  intro?: string;
  note?: string;
}): { subject: string; html: string } {
  // GHL often holds names as typed ("amanda"), so the greeting is capitalised.
  const raw = opts.firstName.trim().split(/\s+/)[0] ?? "";
  const first = raw ? raw[0].toUpperCase() + raw.slice(1) : "";
  const hi = first ? `Hi ${esc(first)},` : "Hi,";
  const rep = opts.repName.trim() || "The Apex team";
  const intro = (opts.intro ?? DEFAULT_OFFER_INTRO).trim();
  const note = (opts.note ?? "").trim();
  const p = (t: string) => `<p>${t}</p>`;
  const a = (href: string, text: string) => `<a href="${href}">${text}</a>`;

  /**
   * Plain on purpose (Stefano, 2026-10-09): the first version, with two
   * styled buttons and a bulleted list, landed in Gmail's Promotions tab.
   * A note that looks typed by the rep, with the links inside sentences,
   * has a better chance at the Primary inbox. Same facts, same links.
   */
  const html = `<div>
${p(hi)}
${intro ? p(esc(intro)) : ""}
${p(
  `You can try Apex for $${DOLLAR_WEEK.price} for the first ${DOLLAR_WEEK.days} days. Upload any supplier price list and it shows you which items make money on Amazon, using real fees and sales rank, and you can build your purchase order straight from the results. You also get 3 vetted US wholesale distributors when you sign up, and 3 more every month.`,
)}
${p(
  `After the week it's $${DOLLAR_WEEK.thenPrice}/month on the ${DOLLAR_WEEK.planLabel} plan. If it's not for you, cancel inside the ${DOLLAR_WEEK.days} days and the dollar is refunded automatically.`,
)}
${p(`You can ${a(offerSignupLink(), `start your $${DOLLAR_WEEK.price} week here`)}.`)}
${p(`If you'd rather go through it together first, ${a(BOOKING_LINK, "grab a time with Stefano, our founder, here")}.`)}
${note ? p(esc(note).replace(/\n/g, "<br>")) : ""}
${p(`${esc(rep)}<br>Apex Applications`)}
</div>`;

  return { subject: first ? `Following up, ${esc(first)}` : "Following up from Apex", html };
}
