"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth/client";
import { migrateGuestToUser } from "@/actions/guests";
import { processLogger } from "@/lib/logger";

/**
 * Hook that automatically migrates guest data to the user account
 * when a session becomes available (sign-in or sign-up).
 */
export function useAuthWithGuestMigration() {
  const { data: session } = useSession();
  const migratedUserIdRef = useRef<string | null>(null);
  const inFlightUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;

    // Trigger migration if:
    // 1. We have a userId
    // 2. We haven't successfully migrated for this user yet
    // 3. We don't already have an in-flight migration for this user
    if (userId && migratedUserIdRef.current !== userId && inFlightUserIdRef.current !== userId) {
      inFlightUserIdRef.current = userId;

      migrateGuestToUser()
        .then(() => {
          migratedUserIdRef.current = userId;
        })
        .catch((error) => {
          processLogger.error("[guest-migration] Failed to migrate guest data:", error);
        })
        .finally(() => {
          inFlightUserIdRef.current = null;
        });
    }
  }, [session?.user?.id]);
}
