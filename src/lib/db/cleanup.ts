import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { and, eq, lt, isNotNull } from "drizzle-orm";
import { SHARE_LINK_RETENTION_DAYS } from "@/config/constants";
import { processLogger } from "@/lib/logger";

/**
 * Purges share links that have been deactivated for longer than the retention period.
 * @param albumId Optional album ID to scope the cleanup.
 */
export async function purgeOldDeactivatedShareLinks(albumId?: string) {
  const cutoff = new Date(
    Date.now() - SHARE_LINK_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  try {
    const conditions = [
      eq(shareLinks.isActive, false),
      isNotNull(shareLinks.deactivatedAt),
      lt(shareLinks.deactivatedAt, cutoff),
    ];

    if (albumId) {
      conditions.push(eq(shareLinks.albumId, albumId));
    }

    const result = await db.delete(shareLinks).where(and(...conditions));
    
    if (result.rowCount > 0) {
      processLogger.info(
        `[cleanup] Purged ${result.rowCount} old deactivated share links${
          albumId ? ` for album ${albumId}` : ""
        }`
      );
    }
  } catch (error) {
    processLogger.error("[cleanup] Purge failed", error);
  }
}
