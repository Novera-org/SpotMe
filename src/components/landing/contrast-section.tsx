import { SectionHeader } from "./section-header";

export function ContrastSection() {
  return (
    <section id="for-guests" className="py-24 px-6 md:px-12 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="The Contrast"
          title="Stop scrolling through strangers."
          centered
        />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="relative border-2 border-black overflow-hidden group fade-in-up h-[500px] bg-white">
            <img
              src="https://images.pexels.com/photos/5082560/pexels-photo-5082560.jpeg?auto=compress&cs=tinysrgb&w=1200&grayscale=true"
              alt="Frustrated person scrolling through photos"
              width={1200}
              height={800}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 z-0"
            />
            <div className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col justify-end border-t-2 border-black bg-white">
              <span className="text-xs font-bold uppercase tracking-widest text-black border border-black px-2 py-1 mb-4 w-max">
                The Old Way
              </span>
              <h3 className="text-2xl text-black uppercase mb-4">
                400 photos to scroll through.
              </h3>
              <p className="text-gray-600 text-xs uppercase leading-relaxed">
                12 hours wasted. Guests spend their night hunting through
                massive online galleries just to find 3 photos of themselves.
                Most give up.
              </p>
            </div>
          </div>

          {/* SpotMe Way */}
          <div className="relative border-2 border-black overflow-hidden group fade-in-up h-[500px] bg-white">
            <img
              src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Happy person finding their photos instantly"
              width={1200}
              height={800}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col justify-end border-t-2 border-black bg-white">
              <span className="text-xs font-bold uppercase tracking-widest text-white bg-black border border-black px-2 py-1 mb-4 w-max">
                The SpotMe Way
              </span>
              <h3 className="text-2xl text-black uppercase mb-4">
                3 seconds to find them all.
              </h3>
              <p className="text-black text-xs uppercase leading-relaxed">
                One selfie, instant results. Our secure AI matches your face
                against the entire gallery and filters the page to show only
                your memories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
