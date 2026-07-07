"use client";

import { motion, useScroll } from "motion/react";
import { RefObject } from "react";

export default function ScrollProgressLine({
  containerRef,
  colorClassName = "bg-brand",
}: {
  containerRef: RefObject<HTMLElement | null>;
  colorClassName?: string;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.2", "end 0.8"],
  });

  return (
    <div
      className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-slate-200" />
      <motion.div
        className={`absolute inset-0 origin-top ${colorClassName}`}
        style={{ scaleY: scrollYProgress }}
      />
    </div>
  );
}
