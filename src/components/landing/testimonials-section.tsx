import { Star } from "lucide-react";
import { SectionHeader } from "./section-header";

const TESTIMONIALS = [
  {
    quote:
      "\u201CI scanned the code on our table, took a horrible selfie, and it instantly found 47 photos of myself across a 2,000 photo gallery. It feels like actual magic.\u201D",
    name: "Sarah Jenkins",
    role: "Wedding Guest",
    image:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
  {
    quote:
      "\u201CClients are blown away by the instant delivery. I used to spend hours sorting faces into folders. Now I drag, drop, and let the software do the heavy lifting.\u201D",
    name: "Mike Torres",
    role: "Event Photographer",
    image:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
  {
    quote:
      "\u201CBest feedback we\u2019ve ever received from attendees. Engagement with our event sponsors skyrocketed because everyone was sharing their branded photos.\u201D",
    name: "Jen Chen",
    role: "Conference Organizer",
    image:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
] as const;

function StarRating() {
  return (
    <div className="flex gap-1 text-black mb-8 mt-6" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} fill="currentColor" stroke="none" aria-hidden="true" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Stories"
          title="Don&apos;t take our word for it."
          centered
        />

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white p-8 border-2 border-black relative fade-in-up flex flex-col"
            >
              <svg
                className="absolute top-6 left-6 w-12 h-12 text-black opacity-10"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <div className="relative z-10 flex flex-col h-full">
                <StarRating />
                <blockquote className="text-black text-xs uppercase mb-8 flex-grow leading-relaxed">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-4 pt-6 border-t-2 border-black mt-auto">
                  <img
                    src={t.image}
                    alt={`${t.name}, ${t.role}`}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="w-12 h-12 rounded-none border border-black object-cover grayscale"
                  />
                  <div>
                    <div className="font-bold text-black text-xs uppercase mb-1">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
