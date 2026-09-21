import "./apex-pop.css";

export type TrustpilotFigures = { score: number; reviews: number; href: string };

/**
 * The profile as it stands. Trustpilot blocks server-side fetches, so this
 * is kept by hand: bump score and reviews when the profile moves.
 */
export const TRUSTPILOT: TrustpilotFigures = {
  score: 4.2,
  reviews: 6,
  href: "https://www.trustpilot.com/review/apexapplications.io",
};

/**
 * The Trustpilot line under the hero button. Five green boxes, filled to the
 * score, then the score and the count. The numbers are passed in by the
 * page because Trustpilot blocks server-side fetches: every landing page
 * passes TRUSTPILOT from here, so the figures are updated in one place.
 */
export default function TrustpilotBadge({ score, reviews, href }: { score: number; reviews: number; href: string }) {
  const filled = Math.max(0, Math.min(5, score));
  return (
    <a
      className="pop-trust"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${score.toFixed(1)} out of 5 on Trustpilot from ${reviews} reviews`}
    >
      <span className="pop-trust-stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, filled - i));
          return (
            <span key={i} className="pop-trust-star">
              <span className="pop-trust-star-fill" style={{ width: `${fill * 100}%` }} />
              <svg viewBox="0 0 24 24" width="13" height="13">
                <path
                  fill="#fff"
                  d="M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6L2.4 9.5l6.7-.8z"
                />
              </svg>
            </span>
          );
        })}
      </span>
      <span className="pop-trust-text">
        <strong>{score.toFixed(1)}</strong> on Trustpilot
        <span className="pop-trust-sep" aria-hidden="true">·</span>
        {reviews} {reviews === 1 ? "review" : "reviews"}
      </span>
      <span className="pop-trust-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            fill="#00b67a"
            d="M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6L2.4 9.5l6.7-.8z"
          />
        </svg>
        Trustpilot
      </span>
    </a>
  );
}
