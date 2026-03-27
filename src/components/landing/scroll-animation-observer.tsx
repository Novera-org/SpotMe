"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Orchestrates GSAP ScrollTrigger-based entrance animations for all
 * `.fade-in-up` elements on the landing page.
 *
 * - Hero section elements animate immediately with a stagger.
 * - All other sections animate on scroll via ScrollTrigger.
 * - Respects `prefers-reduced-motion` — shows content instantly.
 * - Cleans up ScrollTriggers on unmount and sets elements to visible
 *   to prevent blank content on browser back-navigation.
 */
export function ScrollAnimationObserver() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const allFadeElements = document.querySelectorAll(".fade-in-up");

    // If user prefers reduced motion, show everything immediately
    if (prefersReducedMotion) {
      gsap.set(allFadeElements, { opacity: 1, y: 0 });
      return;
    }

    // Reset elements to hidden (handles browser back-navigation stale state)
    gsap.set(allFadeElements, { opacity: 0, y: 30 });

    // ── Hero: immediate staggered reveal ──
    const heroElements = document.querySelectorAll(
      "section:first-of-type .fade-in-up"
    );
    gsap.to(heroElements, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.2,
    });

    // ── Other sections: scroll-triggered reveals ──
    const scrollElements = document.querySelectorAll(
      "section:not(:first-of-type) .fade-in-up"
    );

    const triggers: ScrollTrigger[] = [];

    scrollElements.forEach((el) => {
      const tween = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        paused: true,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
      if (tween.scrollTrigger) {
        triggers.push(tween.scrollTrigger);
      }
    });

    // ── Navbar shadow on scroll ──
    const navTrigger = ScrollTrigger.create({
      start: "20px top",
      onToggle: (self) => {
        const navbar = document.getElementById("navbar");
        if (!navbar) return;
        navbar.classList.toggle(
          "shadow-[0_4px_0_0_rgba(0,0,0,1)]",
          self.isActive
        );
      },
    });
    triggers.push(navTrigger);

    return () => {
      triggers.forEach((st) => st.kill());
      gsap.killTweensOf(allFadeElements);
      // Set visible on cleanup so back-navigation shows content
      gsap.set(allFadeElements, { opacity: 1, y: 0 });
    };
  }, []);

  return null;
}
