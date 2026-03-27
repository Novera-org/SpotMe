"use client";

import Link from "next/link";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#photographers", label: "For Photographers" },
  { href: "#for-guests", label: "For Guests" },
] as const;

export function LandingNavbar() {
  const { scrollTo, scrollToTop } = useSmoothScroll();

  return (
    <nav
      id="navbar"
      className="fixed w-full z-50 transition-shadow duration-300 py-4 px-6 md:px-12 bg-white border-b border-black"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a
          href="#"
          onClick={scrollToTop}
          className="flex flex-col items-start text-xl tracking-widest uppercase text-black no-underline cursor-pointer"
        >
          SPOTME
          <div className="w-10 h-0.5 bg-black mt-1" />
        </a>

        <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-black">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="hover:underline transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/sign-in"
            className="hidden sm:block text-xs tracking-widest uppercase text-black hover:underline transition-colors no-underline"
          >
            Sign In
          </Link>
          <a
            href="#cta"
            onClick={(e) => scrollTo(e, "#cta")}
            className="font-bold text-xs tracking-widest uppercase bg-black text-white px-6 py-2 hover:bg-white hover:text-black border border-black transition-colors no-underline"
          >
            Try for Free
          </a>
        </div>
      </div>
    </nav>
  );
}
