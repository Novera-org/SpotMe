"use server";

import { db } from "@/lib/db";
import { albums, albumSettings, images, session, user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type SessionRecord = {
  id: string;
  device: string;
  location: string;
  lastActiveLabel: string;
  isCurrent: boolean;
};

export async function getAccountSettingsData() {
  const authSession = await requireAdmin();
  const userId = authSession.user.id;

  const [currentUser] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, userId));

  const sessions = await db
    .select({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      updatedAt: session.updatedAt,
      token: session.token,
    })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(asc(session.updatedAt));

  const sessionRecords: SessionRecord[] = sessions
    .slice()
    .reverse()
    .map((item) => ({
      id: item.id,
      device: item.userAgent || "Unknown device",
      location: item.ipAddress || "Unknown location",
      lastActiveLabel: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(item.updatedAt),
      isCurrent: item.token === authSession.session.token,
    }));

  if (!currentUser) {
    throw new Error("User not found");
  }

  return {
    user: currentUser,
    sessions: sessionRecords,
  };
}

export async function updateDisplayName(input: { name: string }) {
  const authSession = await requireAdmin();
  const userId = authSession.user.id;
  const name = input.name?.trim();

  if (!name || name.length < 2) {
    throw new Error("Display name must be at least 2 characters.");
  }

  if (name.length > 100) {
    throw new Error("Display name must be at most 100 characters.");
  }

  await db
    .update(user)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  revalidatePath("/settings/account");
  return { ok: true };
}

export async function revokeSessionById(input: { sessionId: string }) {
  const authSession = await requireAdmin();
  const userId = authSession.user.id;
  const sessionId = input.sessionId;

  if (!sessionId) {
    throw new Error("Missing session id.");
  }

  const [target] = await db
    .select({
      id: session.id,
      token: session.token,
    })
    .from(session)
    .where(and(eq(session.id, sessionId), eq(session.userId, userId)));

  if (!target) {
    throw new Error("Session not found.");
  }

  if (target.token === authSession.session.token) {
    throw new Error("You cannot revoke the current session.");
  }

  await db
    .delete(session)
    .where(and(eq(session.id, sessionId), eq(session.userId, userId)));

  revalidatePath("/settings/account");
  return { ok: true };
}

export async function getAlbumSettingsData() {
  const authSession = await requireAdmin();
  const userId = authSession.user.id;

  const userAlbums = await db.query.albums.findMany({
    where: eq(albums.adminId, userId),
    with: {
      settings: true,
      images: {
        columns: {
          id: true,
          r2Url: true,
          createdAt: true,
        },
        orderBy: [asc(images.createdAt)],
      },
    },
    orderBy: [asc(albums.position), asc(albums.createdAt)],
  });

  return userAlbums.map((album) => ({
    id: album.id,
    title: album.title,
    trackCount: album.images.length,
    visibility: album.settings?.requireLogin ? ("private" as const) : ("public" as const),
    coverUrl: album.images[0]?.r2Url || null,
  }));
}

export async function updateAlbumSettingsEntry(input: {
  albumId: string;
  title: string;
  visibility: "public" | "private";
}) {
  const authSession = await requireAdmin();
  const userId = authSession.user.id;
  const title = input.title?.trim();

  if (!input.albumId) {
    throw new Error("Album id is required.");
  }

  if (!title || title.length < 2) {
    throw new Error("Album title must be at least 2 characters.");
  }

  if (title.length > 100) {
    throw new Error("Album title must be at most 100 characters.");
  }

  const [ownedAlbum] = await db
    .select({ id: albums.id })
    .from(albums)
    .where(and(eq(albums.id, input.albumId), eq(albums.adminId, userId)));

  if (!ownedAlbum) {
    throw new Error("Album not found.");
  }

  await db
    .update(albums)
    .set({
      title,
      updatedAt: new Date(),
    })
    .where(eq(albums.id, input.albumId));

  await db
    .update(albumSettings)
    .set({
      requireLogin: input.visibility === "private",
      updatedAt: new Date(),
    })
    .where(eq(albumSettings.albumId, input.albumId));

  revalidatePath("/settings/albums");
  revalidatePath(`/dashboard/albums/${input.albumId}`);
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function updateAlbumOrder(input: { albumIds: string[] }) {
  const authSession = await requireAdmin();
  const userId = authSession.user.id;

  if (!input.albumIds || !Array.isArray(input.albumIds)) {
    throw new Error("Invalid album ids provided.");
  }

  // Use a transaction to update all album positions at once
  await db.transaction(async (tx) => {
    for (let i = 0; i < input.albumIds.length; i++) {
      const albumId = input.albumIds[i];
      await tx
        .update(albums)
        .set({
          position: i,
          updatedAt: new Date(),
        })
        .where(and(eq(albums.id, albumId), eq(albums.adminId, userId)));
    }
  });

  revalidatePath("/settings/albums");
  revalidatePath("/dashboard");

  return { ok: true };
}
