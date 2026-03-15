"use server";

import { db } from "@/lib/db";
import { albums, images, shareLinks } from "@/lib/db/schema";
import { eq, and, sql, or, gte, isNull } from "drizzle-orm";
import { ALBUM_STATUS } from "@/config/constants";

export async function getPublicAlbum(slug: string) {
  const album = await db.query.albums.findFirst({
    where: and(eq(albums.slug, slug), eq(albums.status, ALBUM_STATUS.ACTIVE)),
    with: {
      settings: true,
    },
  });

  if (!album) return null;

  // Count images for this album
  const [imageCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(images)
    .where(eq(images.albumId, album.id));

  return {
    ...album,
    imageCount: Number(imageCountResult.count),
  };
}

export async function trackShareLinkAccess(code: string) {
  await db
    .update(shareLinks)
    .set({
      accessCount: sql`${shareLinks.accessCount} + 1`,
    })
    .where(
      and(
        eq(shareLinks.code, code),
        eq(shareLinks.isActive, true),
        or(isNull(shareLinks.expiresAt), gte(shareLinks.expiresAt, new Date()))
      )
    );
}
