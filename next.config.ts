import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;

/**
 * Derives the R2 hostname from R2_PUBLIC_URL for Next.js Image Optimization.
 * This is the primary source of truth for R2 image hosting.
 * Matches R2_PUBLIC_URL used in src/lib/storage/r2.ts and api/download/route.ts.
 */
let r2Hostname = "pub-f83181e046814256adff3abdbac66cd1.r2.dev"; // Deliberate fallback for local dev

if (r2PublicUrl) {
  try {
    r2Hostname = new URL(r2PublicUrl).hostname;
  } catch (error) {
    console.warn(
      `[Config] Invalid R2_PUBLIC_URL: "${r2PublicUrl}". Using hardcoded fallback.`,
    );
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: r2Hostname,
      },
    ],
  },
};

export default nextConfig;
