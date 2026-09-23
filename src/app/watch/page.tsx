import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

/**
 * The ad destination: one claim, the proof, and the way in.
 *
 * Built for paid traffic arriving cold from a video ad, so it carries nothing
 * that competes with the walkthrough. Somebody who has just watched fifteen
 * seconds of the software in a feed wants the rest of it, not a tour of the
 * navigation, and every extra section is a place to leave.
 *
 * Kept out of the index like the other funnel pages. It exists to be linked
 * to, and an ad landing page in search results competes with the pages
 * written to rank.
 */
export const metadata: Metadata = {
  title:
    "Watch Apex analyze a catalog and build a purchase order, Apex Applications",
  description:
    "A live walkthrough: a supplier catalog checked against real Amazon fees and a purchase order built from what clears, in under two minutes. Then start your 7 day free trial.",
  alternates: { canonical: "https://www.apexapplications.io/watch" },
  robots: { index: false, follow: false },
};

/**
 * Uploaded 23 September. The embed form is required: youtube.com/v/<id> is
 * the old Flash URL, which redirects to the watch page and is served with
 * X-Frame-Options SAMEORIGIN, so it renders as a blank rectangle.
 *
 * Autoplay is muted because every browser blocks it otherwise, and a player
 * that refuses to start is worse than one the viewer presses. Controls are on
 * so the first click gives them the sound.
 */
const VIDEO_ID = "EClM6RcJ628";
const VIDEO_SRC = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`;

/** Carries the campaign through signup, so the dashboard can attribute it. */
const SIGNUP =
  "/auth?mode=signup&plan=starter&period=monthly&utm_source=ads&utm_medium=video&utm_campaign=watch-demo";

export default function WatchPage() {
  return (
    <section className="bg-slate-950 px-5 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-sky-400">
          <PlayCircle size={15} />
          The two minute walkthrough
        </p>

        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-center text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Watch how Apex analyzes catalogs and builds a purchase order in under
          two minutes, live.
        </h1>

        {/*
          The reason the page exists, so it sits directly under the claim with
          nothing between them.

          Portrait, because the walkthrough is a vertical Short. In a 16:9
          frame it played as a thin strip between two black slabs, which reads
          as a broken embed rather than a deliberate shape. Held at 9:16 and
          capped in width so it is a phone-shaped video on a desktop page and
          a full-width one on an actual phone.
        */}
        <div className="mx-auto mt-10 w-full max-w-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:mt-12 sm:rounded-3xl">
          <div className="aspect-[9/16] w-full">
            <iframe
              src={VIDEO_SRC}
              title="Apex Applications: building an Amazon FBA purchase order"
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          Starts muted. Press the speaker in the player for sound.
        </p>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href={SIGNUP}
            className="flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)] transition-all hover:scale-105 hover:bg-brand-dark active:scale-95"
          >
            Start your 7 day free trial
            <ArrowRight size={18} />
          </Link>
        </div>

        <p className="mx-auto mt-5 max-w-xl text-balance text-center text-base leading-relaxed text-slate-300 sm:text-lg">
          Three supplier catalogs on registration, to give you a lift on Amazon.
        </p>
      </div>
    </section>
  );
}
