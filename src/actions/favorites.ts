"use server";

import { db } from "@/lib/db";
import { savedPhotos, images } from "@/lib/db/schema";
import { requireIdentity, getCurrentIdentity } from "@/lib/auth/identity";
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

  return await db.transaction(async (tx) => {
    // Check if already saved
    const [existing] = await tx
      .select({ id: savedPhotos.id })
      .from(savedPhotos)
      .where(whereClause);

    if (existing) {
      // Unsave
      await tx.delete(savedPhotos).where(eq(savedPhotos.id, existing.id));
      return { saved: false };
    }

    // Save
    // Validate that the image belongs to the album
    const [validImage] = await tx
      .select({ id: images.id })
      .from(images)
      .where(and(eq(images.id, imageId), eq(images.albumId, albumId)))
      .limit(1);

    if (!validImage) {
      throw new Error("Image does not belong to this album");
    }

    await tx.insert(savedPhotos).values({
      albumId,
      imageId,
      userId: identity.userId ?? null,
      guestId: identity.guestId ?? null,
    });

    return { saved: true };
  });
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
    .innerJoin(
      images,
      and(
        eq(savedPhotos.imageId, images.id),
        eq(images.albumId, savedPhotos.albumId),
      ),
    )
    .where(whereClause);

  return saved;
}

// ─── Get Saved Image IDs ────────────────────────────────────────

export async function getSavedImageIds(albumId: string): Promise<string[]> {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return [];
  }

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
