"use client";

import { ChevronDown } from "lucide-react";
import { SectionHeader } from "./section-header";

const FAQS = [
  {
    q: "How does the AI matching work?",
    a: "Our engine analyzes the geometric distances between facial landmarks (like eyes, nose, and mouth) to create a unique numerical signature. It compares this signature against the signatures generated from the event gallery to find matches with 99.2% accuracy.",
  },
  {
    q: "Is my selfie stored?",
    a: "Absolutely not. The selfie you take is processed entirely in the browser\u2019s temporary memory to create a hash. Once the match is complete (usually in 3 seconds), the image file is permanently deleted. We never store, sell, or train our models on your face data.",
  },
  {
    q: "How do I share an album as a photographer?",
    a: "Simply drag and drop your exported JPGs into the SpotMe dashboard. We automatically generate a unique QR code and a short link. You can print the QR code for tables, display it on screens, or email the link to attendees after the event.",
  },
  {
    q: "What file formats are supported?",
    a: "Currently, we support high-resolution JPG and PNG files. We recommend uploading files up to 10\u00A0MB each. Our system automatically optimizes the images for web viewing while allowing guests to download the original high-resolution files.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Photographers can sign up and host their first 3 events (up to 500 photos each) completely free, no credit card required. After that, we offer simple pay-per-event pricing or unlimited monthly subscriptions for high-volume professionals.",
  },
  {
    q: "How accurate is the matching?",
    a: "Our engine maintains a 99.2% accuracy rate even in low light, crowded backgrounds, or side profiles. As long as a portion of the face is visible, SpotMe will find it.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white border-b border-black">
      <div className="max-w-3xl mx-auto">
        <SectionHeader badge="Questions" title="Clear answers." centered />

        <div className="space-y-4 fade-in-up">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white border-2 border-black overflow-hidden"
            >
              <summary className="flex justify-between items-center font-bold text-sm uppercase text-black cursor-pointer p-6 [&::-webkit-details-marker]:hidden list-none">
                {faq.q}
                <span className="transition-transform group-open:rotate-180 text-black">
                  <ChevronDown size={24} strokeWidth={1.5} aria-hidden="true" />
                </span>
              </summary>
              <div className="text-xs text-gray-600 uppercase leading-relaxed px-6 pb-6 pt-6 border-t border-black bg-gray-50">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
