"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { downloads, images, albums, albumSettings } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireIdentity } from "@/lib/auth/identity";
import { logActivity } from "@/lib/activity";

// ─── Track Single Download ──────────────────────────────────────

export async function trackDownload(imageId: string) {
  const uuidParse = z.string().uuid().safeParse(imageId);
  if (!uuidParse.success) {
    return { error: "Invalid image ID" };
  }

  const identity = await requireIdentity();

  // Verify image exists and get album info + settings
  const image = await db
    .select({
      imageId: images.id,
      albumId: images.albumId,
      allowDownloads: albumSettings.allowDownloads,
    })
    .from(images)
    .innerJoin(albums, eq(images.albumId, albums.id))
    .leftJoin(albumSettings, eq(albums.id, albumSettings.albumId))
    .where(eq(images.id, imageId))
    .then((rows) => rows[0]);

  if (!image) {
    return { error: "Image not found" };
  }

  // Check if downloads are allowed
  if (image.allowDownloads === false) {
    return { error: "Downloads are not allowed for this album" };
  }

  // Insert download record
  await db.insert(downloads).values({
    imageId,
    userId: identity.userId,
    guestId: identity.guestId,
    downloadType: "single",
  });

  // Log activity (never throws)
  await logActivity({
    albumId: image.albumId,
    action: "image_downloaded",
    actorType: identity.type,
    actorId: identity.userId || identity.guestId || undefined,
    metadata: { imageId, downloadType: "single" },
  });

  return { success: true };
}

// ─── Track Bulk Download ─────────────────────────────────────────

export async function trackBulkDownload(imageIds: string[]) {
  const arrayParse = z.array(z.string().uuid()).min(1).safeParse(imageIds);
  if (!arrayParse.success) {
    return { error: "Invalid image IDs" };
  }

  const identity = await requireIdentity();

  // Verify all images exist and get their album IDs
  const validImages = await db
    .select({ id: images.id, albumId: images.albumId })
    .from(images)
    .where(inArray(images.id, arrayParse.data));

  if (validImages.length === 0) {
    return { error: "No valid images found" };
  }

  // Insert download records for all valid images
  await db.insert(downloads).values(
    validImages.map((img) => ({
      imageId: img.id,
      userId: identity.userId,
      guestId: identity.guestId,
      downloadType: "bulk" as const,
    }))
  );

  // Log activity for each unique album (never throws)
  const uniqueAlbumIds = [...new Set(validImages.map((img) => img.albumId))];
  for (const albumId of uniqueAlbumIds) {
    await logActivity({
      albumId,
      action: "image_downloaded",
      actorType: identity.type,
      actorId: identity.userId || identity.guestId || undefined,
      metadata: {
        downloadType: "bulk",
        imageCount: validImages.filter((img) => img.albumId === albumId).length,
      },
    });
  }

  return { success: true, downloadCount: validImages.length };
}
