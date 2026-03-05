"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { migrateGuestToUser } from "@/actions/guests";

export function GuestMigrationHandler() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const migratedUserId = useRef<string | null>(null);

  useEffect(() => {
    // Wait for session loading to finish before deciding
    if (isPending) return;

    const userId = session?.user?.id;

    // Trigger migration if we have a user AND we haven't successfully migrated for this specific user yet
    if (userId && migratedUserId.current !== userId) {
      console.log(`[guest-migration] New user session detected: ${userId}. Triggering migration...`);
      
      migrateGuestToUser()
        .then((res) => {
          console.log("[guest-migration] Migration process finished. Result:", res);
          
          // Only mark as migrated for this user if the process completed successfully
          // (Whether data was actually moved or not, we consider the 'attempt' for this user done)
          migratedUserId.current = userId;

          if (res.migrated) {
            console.log("[guest-migration] Data was migrated. Refreshing...");
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("[guest-migration] FATAL: Migration action failed:", error);
          // We do NOT set migratedUserId.current here, allowing for a retry on the next re-render or session change
        });
    }
  }, [session?.user?.id, isPending, router]);

  return null;
}
