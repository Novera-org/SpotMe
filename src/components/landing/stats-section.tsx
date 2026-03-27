const STATS = [
  { value: "50k+", label: "Guests Served" },
  { value: "3s", label: "Avg Match Time" },
  { value: "99.2%", label: "Accuracy" },
  { value: "500+", label: "Events Powered" },
] as const;

export function StatsSection() {
  return (
    <section className="py-16 bg-white border-b border-black px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center border-t border-l border-black">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="fade-in-up border-b border-r border-black p-8 bg-white"
          >
            <div className="text-4xl md:text-5xl text-black mb-2 uppercase tabular-nums">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
