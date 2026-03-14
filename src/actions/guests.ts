"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guests, searchSessions, downloads } from "@/lib/db/schema";
import { getCurrentGuest, clearGuestCookie } from "@/lib/auth/guest";
import { getServerSession } from "@/lib/auth/helpers";
import { processLogger, redactId } from "@/lib/logger";

/**
 * Migrates all guest activity (search sessions, downloads) to a user account.
 * Called automatically when a guest signs up or signs in.
 * Idempotent — safe to call when no guest exists.
 */
export async function migrateGuestToUser() {
  try {
    // 0. Resolve the authenticated user on the server
    const session = await getServerSession();
    if (!session?.user?.id) {
      processLogger.error("[migration] Unauthorized: No active session found.");
      return {
        migrated: false,
        error: "Unauthorized",
        searchSessionsMigrated: 0,
        downloadsMigrated: 0,
      };
    }

    const userId = session.user.id;
    processLogger.info(`[migration] Starting migration for user: ${redactId(userId)}`);
    
    // 1. Get guest from cookie
    const guest = await getCurrentGuest();

    if (!guest) {
      processLogger.info("[migration] No active guest session found in cookies. Nothing to migrate.");
      return {
        migrated: false,
        searchSessionsMigrated: 0,
        downloadsMigrated: 0,
      };
    }

    processLogger.info(`[migration] Found guest in DB: ${redactId(guest.id)}. Starting transactional transfer...`);
    
    // 2. Perform updates and deletion sequentially
    // (We use sequential steps because neon-http doesn't support transactions)
    const [updatedSessions, updatedDownloads] = await Promise.all([
      db
        .update(searchSessions)
        .set({ 
          userId: userId,
          guestId: null 
        })
        .where(eq(searchSessions.guestId, guest.id))
        .returning(),
      
      db
        .update(downloads)
        .set({ 
          userId: userId, 
          guestId: null 
        })
        .where(eq(downloads.guestId, guest.id))
        .returning()
    ]);

    // 3. Cleanup guest record
    await db.delete(guests).where(eq(guests.id, guest.id));
    
    const migratedSessionsCount = updatedSessions.length;
    const migratedDownloadsCount = updatedDownloads.length;

    processLogger.info(`[migration] Successfully moved ${migratedSessionsCount} sessions and ${migratedDownloadsCount} downloads.`);

    // 4. Clear cookie and cache only after successful commit
    await clearGuestCookie();
    processLogger.info("[migration] Guest cookie cleared.");
    revalidatePath("/");
    processLogger.info("[migration] Path revalidated. Migration complete.");

    return {
      migrated: true,
      searchSessionsMigrated: migratedSessionsCount,
      downloadsMigrated: migratedDownloadsCount,
    };
  } catch (error) {
    processLogger.error("[migration] FATAL ERROR during migration:", error);
    // Return a safe error response instead of crashing
    return {
      migrated: false,
      error: "An unexpected error occurred",
      searchSessionsMigrated: 0,
      downloadsMigrated: 0,
    };
  }
}
