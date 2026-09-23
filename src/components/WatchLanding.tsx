import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The ad destination: one claim, the proof, and the way in.
 *
 * Built for paid traffic arriving cold from a video ad, so it carries nothing
 * that competes with the video. Somebody who has just watched fifteen seconds
 * of the software in a feed wants the rest of it, not a tour of the
 * navigation, and every extra section is a place to leave. That is also why
 * there is no rating badge beside the button: the video is the proof, and a
 * second thing asking to be read is a second thing to weigh up.
 *
 * One component behind every version of the page. The ads point at more than
 * one cut of the software, and a page per video copied by hand is a page per
 * video to keep in step: the first time the trial length or the supplier line
 * changes, the copies disagree and the wrong one is the one somebody is
 * paying to send traffic to.
 */

/**
 * Where the video comes from, because the two sources behave differently.
 *
 * A YouTube Short is vertical and has to be framed 9:16 or it plays as a thin
 * strip between two black slabs, which reads as a broken embed rather than a
 * deliberate shape. A file we host is landscape and plays inline.
 */
export type WatchVideo =
  | { kind: "youtube"; id: string; portrait?: boolean }
  | {
      kind: "file";
      src: string;
      poster?: string;
      /**
       * Off for anything long or narration-led. A muted autoplay of a talking
       * head is the worst of both: the viewer misses the opening words while
       * they hunt for the unmute, and the whole file downloads whether or not
       * they ever meant to watch it.
       */
      autoplay?: boolean;
    };

export interface WatchLandingProps {
  eyebrow: string;
  /** The claim, in full. It is the only headline on the page. */
  headline: string;
  video: WatchVideo;
  /** Names the campaign in the signup link, so the dashboard can attribute it. */
  campaign: string;
  /** What the player is showing, for anyone who cannot see it. */
  videoTitle: string;
}

const signupHref = (campaign: string) =>
  `/auth?mode=signup&plan=starter&period=monthly&utm_source=ads&utm_medium=video&utm_campaign=${campaign}`;

function Player({ video, title }: { video: WatchVideo; title: string }) {
  const portrait = video.kind === "youtube" && video.portrait;

  return (
    /*
     * A dark well for the picture and nothing else. On a white page the frame
     * should be the only heavy thing on screen, so it is a soft ring and a
     * long shadow rather than a border.
     */
    <div
      className={`mx-auto w-full overflow-hidden rounded-2xl bg-slate-900 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/10 sm:rounded-3xl ${
        portrait ? "max-w-[21rem] sm:max-w-[23rem]" : "max-w-3xl"
      }`}
    >
      <div className={portrait ? "aspect-[9/16] w-full" : "aspect-video w-full"}>
        {video.kind === "youtube" ? (
          /*
           * The /embed/ form is required. youtube.com/v/<id> is the old Flash
           * URL, which redirects to the watch page and is served with
           * X-Frame-Options SAMEORIGIN, so it renders as a blank rectangle.
           *
           * Muted, because every browser blocks a sound-on autoplay and a
           * player that refuses to start is worse than one the viewer presses.
           */
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          /*
           * preload follows autoplay. A page that is not going to start the
           * video has no business fetching it: this one is paid traffic, often
           * on a phone, and metadata alone is enough to draw the first frame
           * when somebody presses play.
           */
          <video
            className="size-full object-cover"
            src={video.src}
            poster={video.poster}
            controls
            autoPlay={video.autoplay ?? true}
            muted={video.autoplay ?? true}
            loop={video.autoplay ?? true}
            playsInline
            preload={video.autoplay ?? true ? "metadata" : "none"}
          >
            <a href={video.src}>{title}</a>
          </video>
        )}
      </div>
    </div>
  );
}

export default function WatchLanding({
  eyebrow,
  headline,
  video,
  campaign,
  videoTitle,
}: WatchLandingProps) {
  /** Only say "starts muted" where something actually starts. */
  const autoplays = video.kind === "youtube" || (video.autoplay ?? true);

  return (
    /*
     * White, and padded to clear the fixed nav.
     *
     * The nav is white at 80% with a blur, so over the dark version of this
     * page it read as a dark bar with the logo knocked out of it, and the
     * whole thing looked like two unrelated sites stacked. On white it is one
     * surface from the logo down.
     */
    <section className="bg-white px-5 pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>

        <h1 className="mx-auto mt-4 max-w-2xl text-balance text-center text-[1.75rem] font-black leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
          {headline}
        </h1>

        {/* The reason the page exists, so it sits directly under the claim
            with nothing between them. */}
        <div className="mt-9 sm:mt-11">
          <Player video={video} title={videoTitle} />
        </div>

        {autoplays && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Starts muted. Press the speaker in the player for sound.
          </p>
        )}

        <div className="mt-9 flex justify-center sm:mt-11">
          <Link
            href={signupHref(campaign)}
            className="flex w-full max-w-sm items-center justify-center gap-2.5 rounded-xl bg-brand px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)] transition-colors hover:bg-brand-dark"
          >
            Start your 7 day free trial
            <ArrowRight size={17} />
          </Link>
        </div>

        <p className="mx-auto mt-5 max-w-md text-balance text-center text-[0.9375rem] leading-relaxed text-slate-500">
          Three supplier catalogs on registration, to give you a lift on Amazon.
        </p>
      </div>
    </section>
  );
}
