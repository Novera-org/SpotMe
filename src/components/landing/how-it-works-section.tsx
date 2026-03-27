import { QrCode, Camera, Download } from "lucide-react";
import { SectionHeader } from "./section-header";

const STEPS = [
  {
    num: "01",
    icon: QrCode,
    title: "Scan QR Code",
    description:
      "At the event, scan the photographer\u2019s SpotMe table tent code. No app downloads required, it opens instantly in your browser.",
  },
  {
    num: "02",
    icon: Camera,
    title: "Snap a Selfie",
    description:
      "Take a quick selfie so the AI knows who to look for. We convert your face geometry into an encrypted hash immediately.",
  },
  {
    num: "03",
    icon: Download,
    title: "Get Your Photos",
    description:
      "View and download all high-res professional photos featuring you. Share them directly to social media before the night ends.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-6 md:px-12 bg-white border-b border-black"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader badge="Workflow" title="Three steps.<br />Zero friction." />

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white border-2 border-black p-8 relative group fade-in-up"
              >
                <div className="text-4xl text-black absolute top-4 right-4 border border-black px-2 py-1">
                  {step.num}
                </div>
                <div className="relative z-10 pt-16">
                  <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-black mb-8 text-black">
                    <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-xl text-black uppercase mb-4">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 uppercase leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
