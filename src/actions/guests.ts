"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guests, searchSessions, downloads } from "@/lib/db/schema";
import { getCurrentGuest, clearGuestCookie } from "@/lib/auth/guest";

/**
 * Migrates all guest activity (search sessions, downloads) to a user account.
 * Called automatically when a guest signs up or signs in.
 * Idempotent — safe to call when no guest exists.
 */
export async function migrateGuestToUser(userId: string) {
  try {
    console.log(`[migration] Starting migration. Targeted User ID: ${userId}`);
    
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

    console.log(`[migration] Found guest in DB: ${guest.id}. Starting data transfer...`);

    // 2. Perform updates in parallel
    const [migratedSessions, migratedDownloads] = await Promise.all([
      db
        .update(searchSessions)
        .set({ 
          userId: userId, // Ensure this is a valid UUID string
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

    console.log(`[migration] Successfully moved ${migratedSessions.length} search sessions and ${migratedDownloads.length} downloads to user ${userId}.`);

    // 3. Cleanup guest record
    await db.delete(guests).where(eq(guests.id, guest.id));
    console.log(`[migration] Deleted guest record ${guest.id}.`);

    // 4. Clear cookie
    await clearGuestCookie();
    console.log("[migration] Guest cookie cleared. Migration complete.");

    revalidatePath("/");

    return {
      migrated: true,
      searchSessionsMigrated: migratedSessions.length,
      downloadsMigrated: migratedDownloads.length,
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
