"use server";

import { db } from "@/lib/db";
import { albums, albumSettings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { updateAlbumSettingsSchema } from "@/lib/validations/albums";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function updateAlbumSettings(input: unknown) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const parsed = updateAlbumSettingsSchema.safeParse(input);
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

  const [updated] = await db
    .update(albumSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(albumSettings.albumId, albumId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update album settings: Row not found");
  }

  revalidatePath(`/dashboard/albums/${albumId}`);

  return updated;
}
