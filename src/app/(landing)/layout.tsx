import { Space_Mono } from "next/font/google";
import type { Metadata } from "next";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpotMe | Find Every Photo You're In",
  description:
    "Upload one selfie. Our AI scans the entire event gallery and finds every photo you appear in. Done in 3 seconds flat.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${spaceMono.variable} landing-page`}>{children}</div>
  );
}
