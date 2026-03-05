"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guests, searchSessions, downloads } from "@/lib/db/schema";
import { getCurrentGuest, clearGuestCookie } from "@/lib/auth/guest";
import { getServerSession } from "@/lib/auth/helpers";

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
      console.error("[migration] Unauthorized: No active session found.");
      return {
        migrated: false,
        error: "Unauthorized",
        searchSessionsMigrated: 0,
        downloadsMigrated: 0,
      };
    }

    const userId = session.user.id;
    console.log(`[migration] Starting migration. Authenticated User ID: ${userId}`);
    
    // 1. Get guest from cookie
    const guest = await getCurrentGuest();

    if (!guest) {
      console.log("[migration] No active guest session found in cookies. Nothing to migrate.");
      return {
        migrated: false,
        searchSessionsMigrated: 0,
        downloadsMigrated: 0,
      };
    }

    console.log(`[migration] Found guest in DB: ${guest.id}. Starting transactional transfer...`);
    
    // 2. Wrap updates and deletion in a single transaction
    const result = await db.transaction(async (tx) => {
      const [updatedSessions, updatedDownloads] = await Promise.all([
        tx
          .update(searchSessions)
          .set({ 
            userId: userId,
            guestId: null 
          })
          .where(eq(searchSessions.guestId, guest.id))
          .returning(),
        
        tx
          .update(downloads)
          .set({ 
            userId: userId, 
            guestId: null 
          })
          .where(eq(downloads.guestId, guest.id))
          .returning()
      ]);

      // 3. Cleanup guest record inside transaction
      await tx.delete(guests).where(eq(guests.id, guest.id));
      
      return {
        searchCount: updatedSessions.length,
        downloadCount: updatedDownloads.length
      };
    });

    console.log(`[migration] Transaction committed. Moved ${result.searchCount} sessions and ${result.downloadCount} downloads.`);

    // 4. Clear cookie and cache only after successful commit
    await clearGuestCookie();
    console.log("[migration] Guest cookie cleared.");
    revalidatePath("/");
    console.log("[migration] Path revalidated. Migration complete.");

    return {
      migrated: true,
      searchSessionsMigrated: result.searchCount,
      downloadsMigrated: result.downloadCount,
    };
  } catch (error) {
    console.error("[migration] FATAL ERROR during migration:", error);
    // Return a safe error response instead of crashing
    return {
      migrated: false,
      error: error instanceof Error ? error.message : "Unknown migration error",
      searchSessionsMigrated: 0,
      downloadsMigrated: 0,
    };
  }
}
