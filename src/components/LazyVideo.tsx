"use client";

import { useEffect, useRef } from "react";

/**
 * A muted looping product video that costs nothing until it is on screen.
 *
 * The homepage's two videos were 60% of its weight (2.2 MB of 3.7 MB in the
 * October 2026 Lighthouse baseline) and downloaded before anything else
 * could. This one starts fetching when it scrolls into view and pauses when
 * it leaves. With reduced motion requested it never plays on its own; the
 * controls are there instead.
 */
export default function LazyVideo({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.controls = true;
      video.preload = "metadata";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = "auto";
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
