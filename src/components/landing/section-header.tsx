interface SectionHeaderProps {
  badge: string;
  title: string;
  centered?: boolean;
}

/**
 * Reusable section header with badge label and heading.
 * Used across contrast, how-it-works, event-types, testimonials, FAQ sections.
 */
export function SectionHeader({
  badge,
  title,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-16 fade-in-up ${centered ? "text-center" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-black border border-black px-3 py-1 inline-block">
        {badge}
      </span>
      <h2
        className="text-4xl md:text-5xl mt-8 uppercase text-black"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  );
}
