import type { NextConfig } from "next";
import {
  getConfiguredR2ImageHostname,
  logInvalidR2PublicUrl,
} from "./src/lib/storage/r2-public-host";

const r2PublicUrl = process.env.R2_PUBLIC_URL;

/**
 * Derives the R2 hostname from R2_PUBLIC_URL for Next.js Image Optimization.
 * This is the primary source of truth for R2 image hosting.
 * Matches R2_PUBLIC_URL used in src/lib/storage/r2.ts and api/download/route.ts.
 */
const r2Hostname = getConfiguredR2ImageHostname(r2PublicUrl);

if (r2PublicUrl && !r2Hostname) {
  logInvalidR2PublicUrl(r2PublicUrl);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2Hostname
      ? [
          {
            protocol: "https" as const,
            hostname: r2Hostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
