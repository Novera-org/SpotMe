"use client";

import { Sparkles, Play } from "lucide-react";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

function FaceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

export function HeroSection() {
  const { scrollTo } = useSmoothScroll();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-16 px-6 md:px-12 border-b border-black bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
        {/* Copy */}
        <div className="flex flex-col gap-8 fade-in-up">
          <span className="text-xs font-bold uppercase tracking-widest text-black border border-black px-3 py-1 w-max">
            Attendee Experience
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight uppercase text-black tracking-tight">
            Find every
            <br />
            photo <span className="text-highlight">you&apos;re in.</span>
          </h1>
          <p className="text-sm uppercase text-gray-600 max-w-md leading-relaxed">
            Upload one selfie. Our AI scans the entire event gallery and finds
            every photo you appear in. Done in 3 seconds flat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="#cta"
              onClick={(e) => scrollTo(e, "#cta")}
              className="font-bold text-xs tracking-widest uppercase bg-black text-white px-8 py-4 border border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 no-underline"
            >
              <Sparkles size={16} aria-hidden="true" />
              Find My Photos
            </a>
            <button className="font-bold text-xs tracking-widest uppercase bg-white text-black px-8 py-4 border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Play size={16} aria-hidden="true" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Card stack visual */}
        <div className="hero-visual fade-in-up">
          <div className="card-stack">
            <div className="photo-card">
              <img
                src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Concert crowd"
                width={800}
                height={1200}
                loading="eager"
              />
              <div className="card-icon">
                <FaceIcon />
              </div>
            </div>

            <div className="photo-card">
              <img
                src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Party attendees"
                width={800}
                height={1200}
                loading="eager"
              />
              <div className="scan-line" />
              <div className="face-box" />
              <div
                className="card-icon"
                style={{ background: "#000", borderColor: "#000" }}
              >
                <svg viewBox="0 0 24 24" style={{ stroke: "#fff" }} aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <div className="photo-card">
              <img
                src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Wedding guests"
                width={800}
                height={1200}
                loading="eager"
              />
              <div className="card-icon">
                <FaceIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
