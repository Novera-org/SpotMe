"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { migrateGuestToUser } from "@/actions/guests";
import { processLogger } from "@/lib/logger";

export function GuestMigrationHandler() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const migratedUserId = useRef<string | null>(null);
  const inFlightUserId = useRef<string | null>(null);

  useEffect(() => {
    // Wait for session loading to finish before deciding
    if (isPending) return;

    const userId = session?.user?.id;

    // Trigger migration if:
    // 1. We have a userId
    // 2. We haven't successfully migrated for this user yet
    // 3. We don't already have an in-flight migration for this user
    if (userId && migratedUserId.current !== userId && inFlightUserId.current !== userId) {
      

      inFlightUserId.current = userId;
      
      migrateGuestToUser()
        .then((res) => {
          processLogger.info("[guest-migration] Migration process finished. Result:", res);
          
          // Only mark as migrated for this user if the process completed successfully
          migratedUserId.current = userId;

          if (res.migrated) {
            processLogger.info("[guest-migration] Data was migrated. Refreshing...");
            router.refresh();
          }
        })
        .catch((error) => {
          processLogger.error("[guest-migration] FATAL: Migration action failed:", error);
          // We do NOT set migratedUserId.current here, allowing for a retry
        })
        .finally(() => {
          inFlightUserId.current = null;
        });
    }
  }, [session?.user?.id, isPending, router]);

  return null;
}
