import { Shield, Lock, Trash2, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: Lock,
    title: "Encrypted Hashes",
    description:
      "Faces are converted into one-way mathematical hashes. It is impossible to reverse-engineer a photo from our data.",
  },
  {
    icon: Trash2,
    title: "Auto-Deletion",
    description:
      "Selfies are deleted immediately. Entire event galleries automatically expire and self-destruct after 30 days.",
  },
  {
    icon: Globe,
    title: "GDPR Compliant",
    description:
      "Fully compliant with global privacy standards including GDPR and CCPA. You own your data.",
  },
] as const;

export function SecuritySection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white border-b border-black">
      <div className="max-w-4xl mx-auto text-center fade-in-up">
        <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mx-auto mb-8 text-black">
          <Shield size={24} strokeWidth={1.5} aria-hidden="true" />
        </div>

        <h2 className="text-4xl md:text-5xl mb-6 uppercase text-black">
          Your face data is never stored.
        </h2>
        <p className="text-sm uppercase text-gray-600 mb-16 leading-relaxed max-w-2xl mx-auto">
          We believe in transparent, zero-trust security. SpotMe processes your
          selfie in memory and deletes it permanently the second your photos are
          found.
        </p>

        <div className="grid sm:grid-cols-3 gap-8 text-left">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white p-6 border-2 border-black"
              >
                <Icon
                  size={32}
                  strokeWidth={1.5}
                  className="mb-6 text-black"
                  aria-hidden="true"
                />
                <h4 className="font-bold text-black uppercase text-sm mb-4">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-600 uppercase leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
