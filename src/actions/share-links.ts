"use server";

import { db } from "@/lib/db";
import { albums, shareLinks } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { createShareLinkSchema } from "@/lib/validations/albums";
import { verifyAlbumOwnership } from "./albums";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq, and, lt, isNotNull } from "drizzle-orm";
import { processLogger } from "@/lib/logger";

export async function createShareLink(input: unknown) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const parsed = createShareLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { albumId, ...data } = parsed.data;

  // Verify ownership of the album
  await verifyAlbumOwnership(albumId, adminId);

  const code = nanoid(10);

  const [newLink] = await db
    .insert(shareLinks)
    .values({
      albumId,
      code,
      label: data.label || null,
      expiresAt: data.expiresAt,
    })
    .returning();

  revalidatePath(`/dashboard/albums/${albumId}`);

  return newLink;
}

export async function deactivateShareLink(linkId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify admin owns the album through a join
  const [result] = await db
    .select({ albumId: shareLinks.albumId })
    .from(shareLinks)
    .innerJoin(albums, eq(shareLinks.albumId, albums.id))
    .where(and(eq(shareLinks.id, linkId), eq(albums.adminId, adminId)));

  if (!result) {
    throw new Error("Share link not found or access denied");
  }

  await db
    .update(shareLinks)
    .set({ isActive: false, deactivatedAt: new Date() })
    .where(eq(shareLinks.id, linkId));

  revalidatePath(`/dashboard/albums/${result.albumId}`);
}

export async function reactivateShareLink(linkId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify admin owns the album through a join
  const [result] = await db
    .select({ albumId: shareLinks.albumId })
    .from(shareLinks)
    .innerJoin(albums, eq(shareLinks.albumId, albums.id))
    .where(and(eq(shareLinks.id, linkId), eq(albums.adminId, adminId)));

  if (!result) {
    throw new Error("Share link not found or access denied");
  }

  await db
    .update(shareLinks)
    .set({ isActive: true, deactivatedAt: null })
    .where(eq(shareLinks.id, linkId));

  revalidatePath(`/dashboard/albums/${result.albumId}`);
}

export async function getAlbumShareLinks(albumId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify ownership
  await verifyAlbumOwnership(albumId, adminId);

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    await db
      .delete(shareLinks)
      .where(
        and(
          eq(shareLinks.albumId, albumId),
          eq(shareLinks.isActive, false),
          isNotNull(shareLinks.deactivatedAt),
          lt(shareLinks.deactivatedAt, cutoff),
        ),
      );
  } catch (error) {
    // Safeguard if migration hasn't been applied yet.
    processLogger.error("[share-links] Cleanup failed", error);
  }

  return db.query.shareLinks.findMany({
    where: eq(shareLinks.albumId, albumId),
  });
}
