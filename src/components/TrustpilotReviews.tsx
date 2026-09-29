import "./trustpilot-reviews.css";
import { TRUSTPILOT } from "./TrustpilotBadge";

/**
 * The reviews on trustpilot.com/review/apexapplications.io, copied by hand
 * because Trustpilot blocks server-side fetches. Every one is a real review
 * as published there; when a new one lands, add it here and bump TRUSTPILOT.
 * Order: newest first, as the profile shows them.
 */
type Review = {
  name: string;
  country: string;
  stars: number;
  title: string;
  body: string;
  date: string;
};

export const TRUSTPILOT_REVIEWS: Review[] = [
  {
    name: "Sachia Venter",
    country: "CA",
    stars: 5,
    title: "Apex team and software is exceptional for your Amazon business",
    body: "From all the online courses I have bought, this is by far the only one that really care if you ‘make’ it. This team is exceptional and the personal care and attention to each hurdle is just unheard of. Don’t waste your time with other courses. The software and guidance of this one is unmatched. Thank you Stefano for your incredible knowledge and patience. I could not have done this without you.",
    date: "Sep 2026",
  },
  {
    name: "Maria Sanfilippo",
    country: "US",
    stars: 5,
    title: "Genius Company great tool",
    body: "When I got into Amazon reselling I thought I had it figured it out and it took months for me to get the hang of it. Now with Apexapplications my entire business runs almost on autopilot. I know what to be unrated for next, I can see all my projections and inventory restocking and their new repricer I no longer need other softwares aside from keepa to manage my business. Great Tool!",
    date: "Sep 2026",
  },
  {
    name: "Abu Sayed",
    country: "BD",
    stars: 5,
    title: "Finally made the jump from OA to wholesale",
    body: "I did online arbitrage for years because wholesale always felt too complicated and honestly a little intimidating. I didn’t really understand suppliers, purchase orders, ungating, or how to properly research wholesale products. Apex changed that for me. Having the tools, suppliers, product research, and guidance all in one place made wholesale finally make sense. I feel way more confident sourcing and placing orders now, and I wish I had made the switch sooner.",
    date: "Sep 2026",
  },
  {
    name: "Salvatore Spagnolo",
    country: "IT",
    stars: 5,
    title: "A lot easier to manage my Amazon business",
    body: "I’ve used quite a few tools for Amazon FBA, but Apex has made my day-to-day workflow a lot easier. I mainly use it for product research, checking ASINs, finding wholesale opportunities, and keeping my suppliers and purchase orders organized. The ungating tools have been a big help too. What I like most is that Apex isn’t just another product research tool. It covers a lot of what I actually need as an Amazon wholesale seller, from sourcing and supplier research to inventory, restocking, COGS and profit tracking.",
    date: "Sep 2026",
  },
];

function Stars({ value, small }: { value: number; small?: boolean }) {
  return (
    <span className={`tpr-stars${small ? " tpr-stars-sm" : ""}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="tpr-star">
            <span className="tpr-star-fill" style={{ width: `${fill * 100}%` }} />
            <svg viewBox="0 0 24 24" width={small ? 11 : 13} height={small ? 11 : 13}>
              <path
                fill="#fff"
                d="M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6L2.4 9.5l6.7-.8z"
              />
            </svg>
          </span>
        );
      })}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * A strip of the real Trustpilot reviews sliding sideways, for the pages
 * that ask for one action and carry no links: nothing here is clickable,
 * the Trustpilot name is plain text. The list is rendered twice so the
 * loop is seamless; the second copy is hidden from assistive tech.
 */
export default function TrustpilotReviews() {
  const { score, reviews } = TRUSTPILOT;
  const duration = `${Math.max(30, TRUSTPILOT_REVIEWS.length * 12)}s`;
  return (
    <section className="tpr" aria-label="Trustpilot reviews">
      <div className="tpr-head">
        <Stars value={score} />
        <span>
          <strong>{score.toFixed(1)}</strong> <span className="tpr-muted">out of 5</span>
        </span>
        <span className="tpr-muted">
          {reviews} {reviews === 1 ? "review" : "reviews"} on
        </span>
        <span className="tpr-brand">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="#00b67a"
              d="M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6L2.4 9.5l6.7-.8z"
            />
          </svg>
          Trustpilot
        </span>
      </div>
      <div className="tpr-track" style={{ ["--tpr-duration" as string]: duration }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="contents" aria-hidden={copy === 1 || undefined}>
            {TRUSTPILOT_REVIEWS.map((r) => (
              <article key={`${copy}-${r.name}`} className="tpr-card">
                <div className="tpr-card-top">
                  <Stars value={r.stars} small />
                  <span className="tpr-card-date">{r.date}</span>
                </div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
                <div className="tpr-card-who">
                  <span className="tpr-avatar" aria-hidden="true">
                    {initials(r.name)}
                  </span>
                  {r.name} <span className="tpr-muted">· {r.country}</span>
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
