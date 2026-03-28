"use server";

import { db } from "@/lib/db";
import { savedPhotos, images } from "@/lib/db/schema";
import { requireIdentity, getCurrentIdentity } from "@/lib/auth/identity";
import { eq, and } from "drizzle-orm";

function isUniqueConstraintError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("duplicate") || message.includes("unique");
  }

  return false;
}

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

  // Neon HTTP does not support transactions in this app, so keep the toggle
  // flow request-safe with sequential queries instead.
  const [existing] = await db
    .select({ id: savedPhotos.id })
    .from(savedPhotos)
    .where(whereClause);

  if (existing) {
    await db.delete(savedPhotos).where(eq(savedPhotos.id, existing.id));
    return { saved: false };
  }

  const [validImage] = await db
    .select({ id: images.id })
    .from(images)
    .where(and(eq(images.id, imageId), eq(images.albumId, albumId)))
    .limit(1);

  if (!validImage) {
    throw new Error("Image does not belong to this album");
  }

  try {
    await db.insert(savedPhotos).values({
      albumId,
      imageId,
      userId: identity.userId ?? null,
      guestId: identity.guestId ?? null,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { saved: true };
    }

    throw error;
  }

  return { saved: true } ;
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
