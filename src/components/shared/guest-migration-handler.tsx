"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { migrateGuestToUser } from "@/actions/guests";

export function GuestMigrationHandler() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const hasMigrated = useRef(false);

  useEffect(() => {
    // Wait for session loading to finish before deciding
    if (isPending) return;

    const userId = session?.user?.id;

    if (userId && !hasMigrated.current) {
      // User is signed in — migrate any guest data
      console.log("[guest-migration] User session detected:", userId, ". Triggering migration...");
      hasMigrated.current = true;
      migrateGuestToUser(userId)
        .then((res) => {
          console.log("[guest-migration] Migration process finished. Result:", res);
          if (res.migrated) {
            // Trigger a refresh to clear cookies and update server state
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("[guest-migration] FATAL: Migration action failed:", error);
          // Don't reset hasMigrated here to prevent infinite retry loops
        });
    }
  }, [session?.user?.id, isPending, router]);

  return null;
}
