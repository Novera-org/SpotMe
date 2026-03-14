import { createHash } from "node:crypto";

/**
 * Simple logger utility for structured and privacy-aware logging.
 */

/**
 * Redacts an identifier by masking most characters.
 * Useful for logging IDs without exposing direct values in logs.
 * Example: "user_123456789" -> "user_...789"
 */
export function redactId(id: string | null | undefined): string {
  if (!id) return "null";
  if (id.length <= 6) return "***";
  return `${id.slice(0, 3)}...${id.slice(-3)}`;
}

/**
 * Creates a stable pseudonym for an ID by hashing it.
 * This is useful if you need to correlate logs without seeing the raw ID.
 */
export function hashId(id: string | null | undefined): string {
  if (!id) return "null";
  return createHash("sha256").update(id).digest("hex").slice(0, 16);
}

export const processLogger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
