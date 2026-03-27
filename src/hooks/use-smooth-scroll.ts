"use client";

import { useCallback } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const NAVBAR_HEIGHT = 72;

/**
 * Provides GSAP-powered smooth scrolling to anchor targets and to top.
 * Centralizes ScrollToPlugin registration and animation config.
 */
export function useSmoothScroll() {
  const scrollTo = useCallback(
    (e: React.MouseEvent<HTMLElement>, targetSelector: string) => {
      e.preventDefault();
      const target = document.querySelector(targetSelector);
      if (target) {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: target, offsetY: NAVBAR_HEIGHT },
          ease: "power3.inOut",
        });
      }
    },
    []
  );

  const scrollToTop = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: 0 },
      ease: "power3.out",
    });
  }, []);

  return { scrollTo, scrollToTop };
}
