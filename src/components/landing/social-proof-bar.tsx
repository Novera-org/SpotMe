const AVATARS = [
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100",
] as const;

export function SocialProofBar() {
  return (
    <section className="border-b border-black py-8 px-6 bg-white fade-in-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        <div className="flex">
          {AVATARS.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              className={`w-12 h-12 object-cover rounded-none grayscale ${
                i === 0
                  ? "border border-black"
                  : "border-y border-r border-black"
              }`}
            />
          ))}
        </div>
        <div className="text-center md:text-left">
          <p className="font-bold text-black text-sm uppercase tracking-wider">
            50,000+ guests served • 500+ events • 4.9★ rating
          </p>
          <p className="text-gray-500 text-xs uppercase mt-1">
            Trusted by professional photographers worldwide.
          </p>
        </div>
      </div>
    </section>
  );
}
