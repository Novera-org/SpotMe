import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import {
  GUEST_SESSION_COOKIE,
  GUEST_SESSION_MAX_AGE,
} from "@/config/constants";

/**
 * Creates a new guest session.
 */
export async function createGuest() {
  const cookieStore = await cookies();
  
  // Create a new guest with a random session token
  const sessionToken = nanoid(32);
  const [newGuest] = await db
    .insert(guests)
    .values({ sessionToken })
    .returning({ id: guests.id, sessionToken: guests.sessionToken });

  // Set the cookie
  cookieStore.set(GUEST_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GUEST_SESSION_MAX_AGE,
    path: "/",
  });

  return { id: newGuest.id, sessionToken: newGuest.sessionToken };
}

/**
 * Gets or creates a guest session.
 * Reads the guest_session cookie, looks up the guest in the DB,
 * and creates a new one if none exists.
 */
export async function getOrCreateGuest() {
  const guest = await getCurrentGuest();
  if (guest) {
    return guest;
  }
  return createGuest();
}

/**
 * Gets the current guest WITHOUT creating one.
 * Returns null if no guest session exists.
 */
export async function getCurrentGuest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const existing = await db
    .select({ id: guests.id, sessionToken: guests.sessionToken })
    .from(guests)
    .where(eq(guests.sessionToken, token))
    .limit(1);

  if (existing.length === 0) {
    await clearGuestCookie();
    return null;
  }

  return { id: existing[0].id, sessionToken: existing[0].sessionToken };
}

/**
 * Deletes the guest_session cookie.
 */
export async function clearGuestCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_SESSION_COOKIE);
}
