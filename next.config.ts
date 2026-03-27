import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;
let r2Hostname: string | null = null;

if (r2PublicUrl) {
  try {
    r2Hostname = new URL(r2PublicUrl).hostname;
  } catch (error) {
    console.warn(`[Config] Invalid R2_PUBLIC_URL: "${r2PublicUrl}". Hostname extraction failed.`);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f83181e046814256adff3abdbac66cd1.r2.dev",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
