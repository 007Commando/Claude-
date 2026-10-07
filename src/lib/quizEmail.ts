/**
 * The email a /apex-quiz lead gets the moment they unlock their result: the
 * same seller type, diagnosis and three moves as the result screen
 * (quizResults.ts), written as a short note from Stef. Text-first, like the
 * nurture emails, because plain notes from a person outperform designed ones
 * for this audience. No em dashes (house style).
 */
import { DOLLAR_WEEK } from "../config/offer";
import { QUIZ_RESULTS, type QuizResultId } from "./quizResults";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function quizResultEmail(firstName: string, result: QuizResultId): { subject: string; html: string } {
  const r = QUIZ_RESULTS[result];
  const link =
    `https://www.apexapplications.io/auth?mode=signup&plan=${DOLLAR_WEEK.plan}&period=${DOLLAR_WEEK.period}` +
    `&offer=${DOLLAR_WEEK.offer}&from=apex-quiz&utm_source=ghl&utm_medium=email&utm_campaign=apex-quiz&utm_content=quiz-${result}`;
  const hi = firstName ? `Hi ${esc(firstName)},` : "Hi,";
  const p = (t: string) => `<p style="margin:0 0 16px">${t}</p>`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1e293b;max-width:560px">
${p(hi)}
${p(`You came out as <b>${esc(r.name)}</b>. ${esc(r.line)}`)}
${p(esc(r.diagnosis))}
${p("Here's what I'd fix first:")}
<ol style="margin:0 0 16px;padding-left:22px">${r.moves.map((m) => `<li style="margin:0 0 8px">${esc(m)}</li>`).join("")}</ol>
${p(`For a sense of scale: <b>${esc(r.proof[0])}</b> ${esc(r.proof[1])}, from one real distributor catalog. Yours will be different, and that's the point. You see it before you spend anything.`)}
${p(esc(r.plan))}
${p(`If you'd like to try it on your own price list, your first week is $${DOLLAR_WEEK.price}. Not for you? Cancel inside the week and we refund the dollar.`)}
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Start my $${DOLLAR_WEEK.price} week</a></p>
${p("Or just reply with a question about your business. I read these.")}
<p style="margin:0">Stef<br><span style="color:#64748b">CEO, Apex Applications</span></p>
</div>`;
  return { subject: `Your result: ${r.name} (and what to fix first)`, html };
}
