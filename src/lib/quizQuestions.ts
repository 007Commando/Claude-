/**
 * The /apex-quiz questions, shared by the quiz screen and /api/quiz-lead so a
 * label on screen and the tag it becomes in GHL can never drift apart. Every
 * option carries a slug; the API turns slugs into tags, never the labels.
 *
 * The route (Stefano, 2026-10-08): stage first. "Not selling yet" is offered
 * Apex University next; everyone else is asked how they sell. Then the
 * headache, then inventory money. $10,000 or more is a hot lead.
 */

export type QuizQuestionId = "stage" | "university" | "method" | "headache" | "budget";

export interface QuizQuestion {
  id: QuizQuestionId;
  /** A line above the question, when it needs context first. */
  note?: string;
  title: string;
  options: { label: string; slug: string }[];
}

export const QUIZ_QUESTIONS: Record<QuizQuestionId, QuizQuestion> = {
  stage: {
    id: "stage",
    title: "Where are you on Amazon right now?",
    options: [
      { label: "Not selling yet", slug: "not-selling" },
      { label: "Selling, under $5k a month", slug: "under-5k" },
      { label: "$5k to $50k a month", slug: "5k-50k" },
      { label: "Over $50k a month", slug: "over-50k" },
    ],
  },
  university: {
    id: "university",
    note: "Apex University is our Amazon wholesale course, and it's completely free.",
    title: "Want it to be the first thing you see when you log in?",
    options: [
      { label: "Yes, show me the course first", slug: "yes" },
      { label: "No thanks, take me to the software", slug: "no" },
    ],
  },
  method: {
    id: "method",
    title: "Which method do you sell with?",
    options: [
      { label: "Online arbitrage / retail arbitrage", slug: "arbitrage" },
      { label: "Wholesale / brand direct", slug: "wholesale" },
      { label: "Private label", slug: "private-label" },
    ],
  },
  headache: {
    id: "headache",
    title: "What's the biggest headache right now?",
    options: [
      { label: "Finding suppliers who'll open an account", slug: "suppliers" },
      { label: "Knowing what's actually profitable", slug: "profitability" },
      { label: "Restocking without running out", slug: "restocking" },
      { label: "Knowing my real profit", slug: "real-profit" },
    ],
  },
  budget: {
    id: "budget",
    note: "We help sellers find wholesale suppliers, from low minimum orders to bigger accounts.",
    title: "To match you with the right ones, how much could you put into inventory?",
    options: [
      { label: "Under $1,000", slug: "under-1k" },
      { label: "$1,000 to $5,000", slug: "1k-5k" },
      { label: "$5,000 to $10,000", slug: "5k-10k" },
      { label: "$10,000 to $25,000", slug: "10k-25k" },
      { label: "Over $25,000", slug: "over-25k" },
    ],
  },
};

/** Inventory money that marks a hot lead: $10,000 or more. */
export const HOT_BUDGETS = ["10k-25k", "over-25k"];

export type QuizSlugs = Partial<Record<QuizQuestionId, string>>;

/** The slug behind each chosen label. */
export function slugsFor(answers: Partial<Record<QuizQuestionId, string>>): QuizSlugs {
  const out: QuizSlugs = {};
  for (const [id, label] of Object.entries(answers) as [QuizQuestionId, string | undefined][]) {
    const slug = QUIZ_QUESTIONS[id]?.options.find((o) => o.label === label)?.slug;
    if (slug) out[id] = slug;
  }
  return out;
}

/** Valid slugs per question, for the API to check what it is sent. */
export const QUIZ_SLUGS: Record<QuizQuestionId, string[]> = Object.fromEntries(
  Object.values(QUIZ_QUESTIONS).map((q) => [q.id, q.options.map((o) => o.slug)]),
) as Record<QuizQuestionId, string[]>;

/** sessionStorage key: where a new account should land first. Read by sign-up. */
export const LANDING_PREF_KEY = "apex.landingPref";

/**
 * The GHL tags for a set of answers: one per question (quiz-stage:under-5k and
 * so on), plus the plain-word tags the team filters on.
 */
export function quizTags(s: QuizSlugs): string[] {
  const tags: string[] = [];
  for (const id of ["stage", "method", "headache", "budget", "university"] as QuizQuestionId[]) {
    if (s[id]) tags.push(`quiz-${id}:${s[id]}`);
  }
  if (s.stage === "not-selling") tags.push("beginner");
  else if (s.stage) tags.push("currently-selling");
  if (s.method === "arbitrage") tags.push("online-arbitrage");
  if (s.method === "wholesale") tags.push("wholesale");
  if (s.method === "private-label") tags.push("private-label");
  if (s.university === "yes") tags.push("wants-university");
  if (s.budget && HOT_BUDGETS.includes(s.budget)) tags.push("hot-lead");
  return tags;
}
