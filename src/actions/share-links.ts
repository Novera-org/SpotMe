"use server";

import { db } from "@/lib/db";
import { albums, shareLinks } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { createShareLinkSchema } from "@/lib/validations/albums";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createShareLink(input: unknown) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const parsed = createShareLinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { albumId, ...data } = parsed.data;

  // Verify ownership of the album
  const [album] = await db
    .select()
    .from(albums)
    .where(and(eq(albums.id, albumId), eq(albums.adminId, adminId)));

  if (!album) {
    throw new Error("Album not found or access denied");
  }

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
    .set({ isActive: false })
    .where(eq(shareLinks.id, linkId));

  revalidatePath(`/dashboard/albums/${result.albumId}`);
}

export async function getAlbumShareLinks(albumId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify ownership
  const [album] = await db
    .select()
    .from(albums)
    .where(and(eq(albums.id, albumId), eq(albums.adminId, adminId)));

  if (!album) {
    throw new Error("Album not found or access denied");
  }

  return db.query.shareLinks.findMany({
    where: eq(shareLinks.albumId, albumId),
  });
}
