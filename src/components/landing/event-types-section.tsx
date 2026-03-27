import { SectionHeader } from "./section-header";

const EVENTS = [
  {
    image:
      "https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Wedding celebration",
    title: "Weddings",
    description:
      "Relive the night, don\u2019t hunt for it. Give guests their moments instantly.",
  },
  {
    image:
      "https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Conference networking",
    title: "Conferences",
    description:
      "Professional headshots and networking moments delivered before they leave.",
  },
  {
    image:
      "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Graduation ceremony",
    title: "Graduations",
    description: "Find your proudest milestone hidden in the massive crowd.",
  },
  {
    image:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "Corporate team event",
    title: "Corporate",
    description:
      "Team building memories and company offsites, sorted instantly.",
  },
] as const;

export function EventTypesSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Event Types"
          title="Memories for every occasion."
          centered
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENTS.map((event) => (
            <div
              key={event.title}
              className="relative h-96 border-2 border-black group fade-in-up"
            >
              <img
                src={event.image}
                alt={event.alt}
                width={800}
                height={1200}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end bg-white border-t-2 border-black">
                <h3 className="text-xl text-black uppercase mb-2">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-600 uppercase">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
