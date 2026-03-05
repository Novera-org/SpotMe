import { getServerSession } from "@/lib/auth/helpers";
import { getOrCreateGuest, getCurrentGuest } from "@/lib/auth/guest";

export interface Identity {
  type: "user" | "guest";
  userId: string | null;
  guestId: string | null;
}

/**
 * Determines "who is making this request".
 * Checks for a signed-in user first, then falls back to creating a guest.
 * This function guarantees a non-null identity.
 */
export async function requireIdentity(): Promise<Identity> {
  // Check for authenticated user first
  const session = await getServerSession();
  if (session) {
    return { type: "user", userId: session.user.id, guestId: null };
  }

  // Fall back to guest (creates one if needed)
  const guest = await getOrCreateGuest();
  return { type: "guest", userId: null, guestId: guest.id };
}

/**
 * Same as resolveIdentity but WITHOUT creating a new guest.
 * Returns null if neither a user nor a guest session exists.
 */
export async function getCurrentIdentity(): Promise<Identity | null> {
  // Check for authenticated user first
  const session = await getServerSession();
  if (session) {
    return { type: "user", userId: session.user.id, guestId: null };
  }

  // Check for existing guest (don't create)
  const guest = await getCurrentGuest();
  if (guest) {
    return { type: "guest", userId: null, guestId: guest.id };
  }

  return null;
}
