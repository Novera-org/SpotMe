"use server";

import { db } from "@/lib/db";
import { savedPhotos, images } from "@/lib/db/schema";
import { requireIdentity } from "@/lib/auth/identity";
import { eq, and } from "drizzle-orm";

// ─── Toggle Favorite ─────────────────────────────────────────────

export async function toggleFavorite(albumId: string, imageId: string) {
  const identity = await requireIdentity();

  const whereClause = identity.userId
    ? and(
        eq(savedPhotos.albumId, albumId),
        eq(savedPhotos.imageId, imageId),
        eq(savedPhotos.userId, identity.userId),
      )
    : and(
        eq(savedPhotos.albumId, albumId),
        eq(savedPhotos.imageId, imageId),
        eq(savedPhotos.guestId, identity.guestId!),
      );

  // Check if already saved
  const [existing] = await db
    .select({ id: savedPhotos.id })
    .from(savedPhotos)
    .where(whereClause);

  if (existing) {
    // Unsave
    await db.delete(savedPhotos).where(eq(savedPhotos.id, existing.id));
    return { saved: false };
  }

  // Save
  await db.insert(savedPhotos).values({
    albumId,
    imageId,
    userId: identity.userId ?? null,
    guestId: identity.guestId ?? null,
  });

  return { saved: true };
}

// ─── Get Favorites ───────────────────────────────────────────────

export async function getFavorites(albumId: string) {
  const identity = await requireIdentity();

  const whereClause = identity.userId
    ? and(
        eq(savedPhotos.albumId, albumId),
        eq(savedPhotos.userId, identity.userId),
      )
    : and(
        eq(savedPhotos.albumId, albumId),
        eq(savedPhotos.guestId, identity.guestId!),
      );

  const saved = await db
    .select({
      savedPhotoId: savedPhotos.id,
      imageId: savedPhotos.imageId,
      savedAt: savedPhotos.createdAt,
      r2Url: images.r2Url,
      filename: images.filename,
    })
    .from(savedPhotos)
    .innerJoin(images, eq(savedPhotos.imageId, images.id))
    .where(whereClause);

  return saved;
}

// ─── Get Saved Image IDs ────────────────────────────────────────

export async function getSavedImageIds(albumId: string): Promise<string[]> {
  const identity = await requireIdentity();

  const whereClause = identity.userId
    ? and(
        eq(savedPhotos.albumId, albumId),
        eq(savedPhotos.userId, identity.userId),
      )
    : and(
        eq(savedPhotos.albumId, albumId),
        eq(savedPhotos.guestId, identity.guestId!),
      );

  const rows = await db
    .select({ imageId: savedPhotos.imageId })
    .from(savedPhotos)
    .where(whereClause);

  return rows.map((r) => r.imageId);
}
