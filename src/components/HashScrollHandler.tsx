"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getGlowColor(pathname: string): string {
  if (pathname.includes("/features/blue")) return "rgba(37, 99, 235, 0.6)";
  if (pathname.includes("/features/green")) return "rgba(34, 197, 94, 0.6)";
  if (pathname.includes("/features/black")) return "rgba(15, 23, 42, 0.55)";
  if (pathname.includes("/features/red")) return "rgba(220, 38, 38, 0.55)";
  return "rgba(37, 99, 235, 0.6)";
}

function applyGlow(element: HTMLElement, color: string) {
  const prevTransition = element.style.transition;
  const prevBoxShadow = element.style.boxShadow;
  const prevBorderRadius = element.style.borderRadius;

  const computedRadius = window.getComputedStyle(element).borderRadius;
  element.style.transition = "box-shadow 1.2s ease-in-out";
  element.style.borderRadius = computedRadius || "32px";
  element.style.boxShadow = `0 0 0 4px ${color}, 0 0 60px 10px ${color}`;

  const fadeTimeout = window.setTimeout(() => {
    element.style.boxShadow = `0 0 0 0px ${color}, 0 0 0px 0px ${color}`;
  }, 1600);

  const cleanupTimeout = window.setTimeout(() => {
    element.style.boxShadow = prevBoxShadow;
    element.style.transition = prevTransition;
    element.style.borderRadius = prevBorderRadius;
  }, 3000);

  return () => {
    window.clearTimeout(fadeTimeout);
    window.clearTimeout(cleanupTimeout);
    element.style.boxShadow = prevBoxShadow;
    element.style.transition = prevTransition;
    element.style.borderRadius = prevBorderRadius;
  };
}

export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const runFromHash = () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }

      const hash = window.location.hash;
      if (!hash) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const id = hash.replace("#", "");
      let attempts = 0;

      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: "smooth" });

          const color = getGlowColor(pathname);
          const cleanups: (() => void)[] = [];

          // Target image container and CTA inside the section, not the whole section
          const image = el.querySelector<HTMLElement>("[data-feature-image]");
          const cta = el.querySelector<HTMLElement>("[data-feature-cta]");

          if (image) cleanups.push(applyGlow(image, color));
          if (cta) cleanups.push(applyGlow(cta, color));

          cleanup = () => {
            cleanups.forEach((fn) => fn());
          };
        } else if (attempts < 20) {
          attempts += 1;
          setTimeout(tryScroll, 50);
        }
      };
      tryScroll();
    };

    runFromHash();
    window.addEventListener("hashchange", runFromHash);

    return () => {
      window.removeEventListener("hashchange", runFromHash);
      if (cleanup) cleanup();
    };
  }, [pathname]);

  return null;
}
