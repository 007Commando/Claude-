import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import TrustpilotBadge, { TRUSTPILOT } from "./TrustpilotBadge";

/**
 * The ad destination: one claim, the proof, and the way in.
 *
 * Built for paid traffic arriving cold from a video ad, so it carries nothing
 * that competes with the video. Somebody who has just watched fifteen seconds
 * of the software in a feed wants the rest of it, not a tour of the
 * navigation, and every extra section is a place to leave.
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
    <div
      className={`mx-auto mt-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:mt-12 sm:rounded-3xl ${
        portrait ? "max-w-[26rem]" : "max-w-4xl"
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
    <section className="bg-slate-950 px-5 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-sky-400">
          <PlayCircle size={15} />
          {eyebrow}
        </p>

        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-center text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {headline}
        </h1>

        {/* The reason the page exists, so it sits directly under the claim
            with nothing between them. */}
        <Player video={video} title={videoTitle} />

        {autoplays && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Starts muted. Press the speaker in the player for sound.
          </p>
        )}

        <div className="mt-10 flex flex-col items-center gap-5 sm:mt-12">
          <Link
            href={signupHref(campaign)}
            className="flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)] transition-all hover:scale-105 hover:bg-brand-dark active:scale-95"
          >
            Start your 7 day free trial
            <ArrowRight size={18} />
          </Link>

          {/*
            Under the button, where the badge is designed to sit and where it
            answers the question the button just raised.

            The custom properties are supplied here because the badge's CSS
            defines them on .pop-page, a class this page does not use. Without
            them `color: var(--body)` and `border: 1px solid var(--line)`
            resolve to nothing, so the pill inherited this section's white text
            onto its white background and rendered as five stars and no words.
            Same values .pop-page sets, so the badge looks like itself.
          */}
          <span
            style={
              {
                "--ink-strong": "#12151c",
                "--body": "#6b7280",
                "--faint": "#9199a8",
                "--line": "#e5e7eb",
              } as React.CSSProperties
            }
          >
            <TrustpilotBadge {...TRUSTPILOT} />
          </span>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-balance text-center text-base leading-relaxed text-slate-300 sm:text-lg">
          Three supplier catalogs on registration, to give you a lift on Amazon.
        </p>
      </div>
    </section>
  );
}
