import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { and, eq, lt, isNotNull } from "drizzle-orm";
import { SHARE_LINK_RETENTION_DAYS } from "@/config/constants";
import { processLogger } from "@/lib/logger";

function getShareLinkCleanupCutoff() {
  return new Date(
    Date.now() - SHARE_LINK_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );
}

/**
 * Purges share links that have been deactivated for longer than the retention period.
 * Request-path cleanup must always be scoped to a single album.
 */
export async function purgeOldDeactivatedShareLinks(albumId: string) {
  if (!albumId) {
    throw new Error("albumId is required for scoped share link cleanup.");
  }

  const cutoff = getShareLinkCleanupCutoff();

  try {
    const conditions = [
      eq(shareLinks.isActive, false),
      isNotNull(shareLinks.deactivatedAt),
      lt(shareLinks.deactivatedAt, cutoff),
      eq(shareLinks.albumId, albumId),
    ];

    const result = await db.delete(shareLinks).where(and(...conditions));

    if (result.rowCount > 0) {
      processLogger.info(
        `[cleanup] Purged ${result.rowCount} old deactivated share links for album ${albumId}`
      );
    }
  } catch (error) {
    processLogger.error("[cleanup] Purge failed", error);
  }
}

/**
 * Global cleanup is intended for scheduled/background jobs only.
 */
export async function purgeAllDeactivatedShareLinks() {
  const cutoff = getShareLinkCleanupCutoff();

  try {
    const result = await db.delete(shareLinks).where(
      and(
        eq(shareLinks.isActive, false),
        isNotNull(shareLinks.deactivatedAt),
        lt(shareLinks.deactivatedAt, cutoff),
      )
    );

    if (result.rowCount > 0) {
      processLogger.info(
        `[cleanup] Purged ${result.rowCount} old deactivated share links globally`
      );
    }
  } catch (error) {
    processLogger.error("[cleanup] Global purge failed", error);
  }
}
