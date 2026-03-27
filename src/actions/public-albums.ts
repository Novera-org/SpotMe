"use server";

import { db } from "@/lib/db";
import { albums, images, shareLinks } from "@/lib/db/schema";
import { eq, and, sql, or, gte, isNull } from "drizzle-orm";
import { ALBUM_STATUS } from "@/config/constants";
import { logActivity } from "@/lib/activity";
import { getCurrentIdentity } from "@/lib/auth/identity";

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

export async function validateShareLink(code: string, albumId: string) {
  const link = await db.query.shareLinks.findFirst({
    where: and(
      eq(shareLinks.code, code),
      eq(shareLinks.albumId, albumId),
      eq(shareLinks.isActive, true),
      or(isNull(shareLinks.expiresAt), gte(shareLinks.expiresAt, new Date()))
    ),
  });

  return link || null;
}

export async function trackShareLinkAccess(
  code: string,
  preloadedLink?: typeof shareLinks.$inferSelect,
) {
  // Fetch the share link to get the albumId for activity logging
  const link =
    preloadedLink ||
    (await db.query.shareLinks.findFirst({
      where: and(
        eq(shareLinks.code, code),
        eq(shareLinks.isActive, true),
        or(isNull(shareLinks.expiresAt), gte(shareLinks.expiresAt, new Date())),
      ),
    }));

  if (!link) return;

  await db
    .update(shareLinks)
    .set({
      accessCount: sql`${shareLinks.accessCount} + 1`,
    })
    .where(eq(shareLinks.id, link.id));

  // Log album viewed activity
  const identity = await getCurrentIdentity();
  await logActivity({
    albumId: link.albumId,
    action: "album_viewed",
    actorType: identity?.type ?? "guest",
    actorId: identity?.userId || identity?.guestId || undefined,
  });
}
