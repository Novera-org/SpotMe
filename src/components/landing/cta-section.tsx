export function CtaSection() {
  return (
    <section
      id="cta"
      className="py-32 px-6 md:px-12 bg-white text-center border-b border-black relative"
    >
      <div className="max-w-3xl mx-auto relative z-10 fade-in-up">
        <h2 className="text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight uppercase text-black">
          Your next event deserves to be remembered.
        </h2>
        <p className="text-sm text-gray-600 uppercase mb-12 max-w-xl mx-auto leading-relaxed">
          Free to start. No credit card required. Give your guests the magic of
          finding their photos instantly.
        </p>

        <a
          href="#"
          className="inline-flex font-bold text-sm tracking-widest uppercase bg-black text-white px-10 py-5 border border-black hover:bg-white hover:text-black transition-colors no-underline"
        >
          Create Your First Event
        </a>

        <p className="text-xs text-gray-500 uppercase tracking-widest mt-8">
          Join 50,000+ guests who never miss a photo.
        </p>
      </div>
    </section>
  );
}
