import { Activity, CheckCircle, ArrowRight } from "lucide-react";

const BENEFITS = [
  {
    title: "Save hours on delivery",
    description:
      "Bulk upload directly from Lightroom. We handle the sorting and delivery.",
  },
  {
    title: "Delight clients instantly",
    description:
      "No waiting weeks for the gallery. Guests leave with their photos in hand.",
  },
  {
    title: "Grow word-of-mouth",
    description:
      "Your branding stays front and center on every shared photo.",
  },
  {
    title: "Upload 1,000+ photos in minutes",
    description:
      "Our background processing compresses and indexes galleries without crashing your browser.",
  },
] as const;

export function PhotographersSection() {
  return (
    <section
      id="photographers"
      className="py-24 px-6 md:px-12 bg-white border-b border-black relative"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="relative h-[600px] border-2 border-black overflow-hidden fade-in-up">
          <img
            src="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Professional event photographer at work"
            width={1200}
            height={800}
            loading="lazy"
            className="w-full h-full object-cover grayscale contrast-125"
          />
          <div className="absolute bottom-6 left-6 right-6 bg-white p-6 border-2 border-black flex items-center gap-4">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-white border border-black">
              <Activity size={24} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                Processing Time
              </div>
              <div className="font-bold text-black text-sm uppercase">
                Reduced by 95%
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="fade-in-up">
          <span className="text-xs font-bold uppercase tracking-widest text-black border border-black px-3 py-1 inline-block">
            For Professionals
          </span>
          <h2 className="text-4xl md:text-5xl mt-8 mb-6 uppercase text-black leading-tight">
            Give your clients a magic moment.
          </h2>
          <p className="text-sm uppercase text-gray-600 mb-10 leading-relaxed">
            Stop spending twelve hours organizing folders and sending individual
            links. Deliver a frictionless, modern experience that turns guests
            into future clients.
          </p>

          <ul className="space-y-6 mb-10 list-none p-0">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit.title}
                className="flex items-start gap-4 border-b border-black pb-4"
              >
                <CheckCircle
                  size={20}
                  strokeWidth={2}
                  className="flex-shrink-0 mt-1 text-black"
                  aria-hidden="true"
                />
                <div>
                  <strong className="text-black uppercase text-sm block mb-2">
                    {benefit.title}
                  </strong>
                  <span className="text-gray-600 text-xs uppercase leading-relaxed block">
                    {benefit.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <a
            href="#cta"
            className="inline-flex font-bold text-xs uppercase bg-black text-white px-8 py-4 border border-black hover:bg-white hover:text-black transition-colors items-center justify-center gap-2 no-underline"
          >
            Start Uploading
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
