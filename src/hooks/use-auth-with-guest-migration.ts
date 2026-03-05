"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth/client";
import { migrateGuestToUser } from "@/actions/guests";

/**
 * Hook that automatically migrates guest data to the user account
 * when a session becomes available (sign-in or sign-up).
 */
export function useAuthWithGuestMigration() {
  const { data: session } = useSession();
  const hasMigrated = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId || hasMigrated.current) return;

    hasMigrated.current = true;

    migrateGuestToUser(userId).catch((error) => {
      console.error("[guest-migration] Failed to migrate guest data:", error);
      // Reset so it can retry on next render
      hasMigrated.current = false;
    });
  }, [session?.user?.id]);
}
