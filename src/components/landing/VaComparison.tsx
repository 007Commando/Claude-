import { Check, Minus, ShieldCheck } from "lucide-react";

import { Rail } from "./OfferKit";

/**
 * Apex assistants against the freelancer marketplaces.
 *
 * Two rules hold this section together.
 *
 * Their rates are given as the typical listed range with a dated note, not as
 * a fixed figure — marketplace pricing moves, and a stale number on a live
 * comparison page is a claim we would have to stand behind.
 *
 * On capability the marketplaces get "varies by hire" rather than a cross.
 * Plenty of good freelancers can do this work; the honest argument is that you
 * cannot tell which one you have booked until you have paid them. Overstating
 * it would be the one thing that makes a reader distrust the rest of the page.
 */

const RATE_NOTE_AS_OF = "September 2026";

type Cell = { state: "yes" | "varies"; text: string };

const ROWS: { label: string; apex: Cell; fiverr: Cell; upwork: Cell }[] = [
  {
    label: "Hourly rate",
    apex: { state: "yes", text: "$5.00 – $6.50, fixed" },
    fiverr: { state: "varies", text: "$6 – $15 typical" },
    upwork: { state: "varies", text: "$6 – $15 typical" },
  },
  {
    label: "Amazon wholesale experience",
    apex: { state: "yes", text: "High — trained on the model before placement" },
    fiverr: { state: "varies", text: "A gamble. Often low or unrelated" },
    upwork: { state: "varies", text: "A gamble. Often low or unrelated" },
  },
  {
    label: "Trackable performance",
    apex: {
      state: "yes",
      text: "Guaranteed. Their work lands in your Apex account, so you see it",
    },
    fiverr: { state: "varies", text: "Whatever they choose to report" },
    upwork: { state: "varies", text: "Whatever they choose to report" },
  },
];

const SKILLS = [
  "Buying and purchase orders",
  "Product research",
  "Inventory management",
  "Shipment creation",
  "Account health",
];

/**
 * Fiverr and Upwork set as typographic wordmarks in their own brand colours.
 * Naming a competitor in a comparison is ordinary practice; reproducing their
 * logo artwork is a different thing, and at this size a wordmark reads the
 * same. Drop real files in and swap these out if you obtain permission.
 */
function Wordmark({ name, color }: { name: string; color: string }) {
  return (
    <span className="text-xl font-black tracking-tight" style={{ color }}>
      {name}
    </span>
  );
}

function StateIcon({ state }: { state: Cell["state"] }) {
  return state === "yes" ? (
    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
  ) : (
    <Minus className="mt-1 size-4 shrink-0 text-slate-300" aria-hidden />
  );
}

export default function VaComparison() {
  const columns = [
    { key: "apex", head: null },
    { key: "fiverr", head: <Wordmark name="fiverr" color="#1DBF73" /> },
    { key: "upwork", head: <Wordmark name="Upwork" color="#14A800" /> },
  ] as const;

  return (
    <section id="compare" className="scroll-mt-24 bg-white py-16 lg:py-20">
      <Rail>
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h3 className="mb-5 text-4xl font-extrabold tracking-tight text-slate-900">
            The same hour. Two very different things you are buying.
          </h3>
          <p className="text-lg leading-relaxed text-slate-600">
            We are not the expensive option. We are the one where you know what
            arrives.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
          {/* Column heads. Below lg the table stacks, so each cell names itself. */}
          <div className="hidden lg:grid lg:grid-cols-[1.1fr_1.2fr_1fr_1fr]">
            <div className="bg-white p-7" />
            <div className="flex items-center justify-center bg-brand/[0.06] p-7">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Apex Assistants
              </span>
            </div>
            {columns.slice(1).map((c) => (
              <div
                key={c.key}
                className="flex items-center justify-center bg-white p-7"
              >
                {c.head}
              </div>
            ))}
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr_1fr_1fr] ${
                i > 0 ? "border-t border-slate-200" : "lg:border-t lg:border-slate-200"
              }`}
            >
              <div className="bg-slate-50 px-7 py-5 lg:bg-white lg:py-7">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {row.label}
                </span>
              </div>

              {(["apex", "fiverr", "upwork"] as const).map((key) => {
                const cell = row[key];
                const isApex = key === "apex";
                return (
                  <div
                    key={key}
                    className={`border-t border-slate-100 px-7 py-5 lg:border-t-0 lg:py-7 ${
                      isApex ? "bg-brand/[0.06]" : "bg-white"
                    }`}
                  >
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 lg:hidden">
                      {key === "apex"
                        ? "Apex"
                        : key === "fiverr"
                          ? "Fiverr"
                          : "Upwork"}
                    </span>
                    <div className="flex gap-3">
                      <StateIcon state={cell.state} />
                      <p
                        className={`text-sm leading-relaxed ${
                          isApex
                            ? "font-semibold text-slate-800"
                            : "text-slate-500"
                        }`}
                      >
                        {cell.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Capability block */}
          <div className="border-t border-slate-200 bg-slate-50 px-7 py-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Experience in
            </span>
          </div>

          {SKILLS.map((skill) => (
            <div
              key={skill}
              className="grid grid-cols-1 border-t border-slate-100 lg:grid-cols-[1.1fr_1.2fr_1fr_1fr]"
            >
              <div className="bg-white px-7 pt-5 lg:py-6">
                <span className="text-sm font-medium text-slate-700">
                  {skill}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-brand/[0.06] px-7 py-4 lg:justify-center lg:py-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand lg:hidden">
                  Apex
                </span>
                <Check className="size-4 shrink-0 text-brand" aria-hidden />
                <span className="text-sm font-semibold text-slate-800">
                  Trained
                </span>
              </div>

              {(["fiverr", "upwork"] as const).map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 bg-white px-7 py-4 lg:justify-center lg:py-6"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 lg:hidden">
                    {key === "fiverr" ? "Fiverr" : "Upwork"}
                  </span>
                  <Minus className="size-4 shrink-0 text-slate-300" aria-hidden />
                  <span className="text-sm text-slate-500">Varies by hire</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-slate-400">
          Fiverr and Upwork are independent marketplaces with no affiliation to
          Apex Applications, and their names and marks belong to them. Rates
          shown for those platforms are typical listed ranges as of{" "}
          {RATE_NOTE_AS_OF} and vary by freelancer.
        </p>
      </Rail>
    </section>
  );
}

/**
 * The guarantee.
 *
 * Worded strictly against what the offer already promises — seven days at no
 * cost — rather than a refund policy we have not written. A guarantee is a
 * commercial commitment, and the page should not invent terms someone will
 * later be held to.
 */
export function SatisfactionGuarantee() {
  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <Rail>
        <div className="mx-auto grid max-w-5xl items-center gap-12 rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)] lg:grid-cols-[auto_1fr] lg:gap-16 lg:p-14">
          {/* Seal */}
          <div className="mx-auto shrink-0">
            <svg
              viewBox="0 0 200 200"
              className="h-40 w-40 lg:h-48 lg:w-48"
              role="img"
              aria-label="Apex satisfaction guarantee seal"
            >
              <defs>
                <linearGradient id="sealFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2387BA" />
                  <stop offset="100%" stopColor="#1B6B94" />
                </linearGradient>
              </defs>

              {/* Scalloped edge, drawn rather than imported so it scales cleanly */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 360) / 36;
                const rad = (angle * Math.PI) / 180;
                return (
                  <circle
                    key={i}
                    cx={100 + 88 * Math.cos(rad)}
                    cy={100 + 88 * Math.sin(rad)}
                    r="7"
                    fill="url(#sealFill)"
                  />
                );
              })}

              <circle cx="100" cy="100" r="88" fill="url(#sealFill)" />
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />

              <text
                x="100"
                y="62"
                textAnchor="middle"
                fill="#ffffff"
                fillOpacity="0.75"
                fontSize="11"
                fontWeight="700"
                letterSpacing="3"
              >
                APEX
              </text>
              <text
                x="100"
                y="102"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="34"
                fontWeight="900"
                letterSpacing="-1"
              >
                7 DAYS
              </text>
              <text
                x="100"
                y="121"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                letterSpacing="2.5"
              >
                FREE
              </text>
              <line
                x1="66"
                y1="133"
                x2="134"
                y2="133"
                stroke="#ffffff"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              {/*
                Two lines, not one. A single "SATISFACTION GUARANTEED" is wider
                than the circle's chord at this height and runs off the edge.
              */}
              <text
                x="100"
                y="150"
                textAnchor="middle"
                fill="#ffffff"
                fillOpacity="0.9"
                fontSize="10"
                fontWeight="700"
                letterSpacing="1.4"
              >
                SATISFACTION
              </text>
              <text
                x="100"
                y="164"
                textAnchor="middle"
                fill="#ffffff"
                fillOpacity="0.9"
                fontSize="10"
                fontWeight="700"
                letterSpacing="1.4"
              >
                GUARANTEED
              </text>
            </svg>
          </div>

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
              <ShieldCheck size={14} />
              Our guarantee
            </div>

            <h3 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
              Judge the work before you pay for any of it.
            </h3>

            <p className="mb-8 text-lg leading-relaxed text-slate-600">
              Your first seven days cost nothing. Hand your assistant the work
              that has been sitting on your desk, watch it land in your Apex
              account, and decide from what you can see rather than from a
              promise on a landing page.
            </p>

            <ul className="space-y-4">
              {[
                [
                  "Nothing to pay for the first week",
                  "If it is not right, you walk away having spent nothing.",
                ],
                [
                  "You see the output, not a status update",
                  "Purchase orders, research and restocks appear in your own account.",
                ],
                [
                  "A fixed rate after that",
                  "$5.00 – $6.50 an hour, with no platform fee on top.",
                ],
              ].map(([title, sub]) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 shadow-sm">
                    <Check className="size-4 text-brand" aria-hidden />
                  </div>
                  <div>
                    <span className="mb-0.5 block text-sm font-bold text-slate-800">
                      {title}
                    </span>
                    <span className="text-sm text-slate-600">{sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Rail>
    </section>
  );
}
