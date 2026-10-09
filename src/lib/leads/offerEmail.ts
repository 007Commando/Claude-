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
  const p = (t: string) => `<p style="margin:0 0 16px">${t}</p>`;
  const li = (t: string) => `<li style="margin:0 0 8px">${t}</li>`;
  const button = (href: string, label: string, primary: boolean) =>
    `<a href="${href}" style="display:inline-block;${
      primary ? "background:#2563eb;color:#fff;" : "background:#fff;color:#2563eb;border:1px solid #2563eb;"
    }text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${label}</a>`;

  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1e293b;max-width:560px">
${p(hi)}
${intro ? p(esc(intro)) : ""}
${p(`<b>Try Apex for $${DOLLAR_WEEK.price} for ${DOLLAR_WEEK.days} days.</b> Here's what that gets you:`)}
<ul style="margin:0 0 16px;padding-left:22px">
${li("Upload any supplier price list and see which items make money on Amazon, checked against real fees and sales rank in minutes")}
${li("Build your purchase order straight from the results")}
${li("3 vetted US wholesale distributors when you sign up, then 3 more every month")}
</ul>
${p(`After the week it's Apex ${DOLLAR_WEEK.planLabel} at $${DOLLAR_WEEK.thenPrice}/month. Not for you? Cancel inside the ${DOLLAR_WEEK.days} days and we refund the dollar automatically.`)}
<p style="margin:0 0 24px">${button(offerSignupLink(), `Start my $${DOLLAR_WEEK.price} week`, true)}</p>
${p("Rather go through it together first? Pick a time with Stefano, our founder, and he'll walk you through it on your own price list.")}
<p style="margin:0 0 24px">${button(BOOKING_LINK, "Book a call", false)}</p>
${note ? p(esc(note).replace(/\n/g, "<br>")) : ""}
<p style="margin:0">${esc(rep)}<br><span style="color:#64748b">Apex Applications</span></p>
</div>`;

  return { subject: `Your $${DOLLAR_WEEK.price} week with Apex (and a time to talk)`, html };
}
