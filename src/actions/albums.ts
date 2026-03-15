"use server";

import { db } from "@/lib/db";
import { albums, albumSettings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  createAlbumSchema,
  updateAlbumSchema,
} from "@/lib/validations/albums";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createAlbum(formData: FormData) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };

  const parsed = createAlbumSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = `${slugify(parsed.data.title, { lower: true, strict: true })}-${nanoid(6)}`;

  const newAlbum = await db.transaction(async (tx) => {
    const [album] = await tx
      .insert(albums)
      .values({
        adminId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        slug,
      })
      .returning();

    // Create default album settings row
    await tx.insert(albumSettings).values({
      albumId: album.id,
    });

    return album;
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/albums/${newAlbum.id}`);
}

export async function updateAlbum(input: unknown) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const parsed = updateAlbumSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { id, ...data } = parsed.data;

  // Verify ownership
  const [existing] = await db
    .select()
    .from(albums)
    .where(and(eq(albums.id, id), eq(albums.adminId, adminId)));

  if (!existing) {
    throw new Error("Album not found or access denied");
  }

  const [updated] = await db
    .update(albums)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(albums.id, id))
    .returning();

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/albums/${id}`);

  return updated;
}

export async function deleteAlbum(albumId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify ownership
  const [existing] = await db
    .select()
    .from(albums)
    .where(and(eq(albums.id, albumId), eq(albums.adminId, adminId)));

  if (!existing) {
    throw new Error("Album not found or access denied");
  }

  await db.delete(albums).where(eq(albums.id, albumId));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getAdminAlbums() {
  const session = await requireAdmin();
  const adminId = session.user.id;

  return db.query.albums.findMany({
    where: eq(albums.adminId, adminId),
    orderBy: [desc(albums.createdAt)],
  });
}

export async function getAlbumById(albumId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const album = await db.query.albums.findFirst({
    where: and(eq(albums.id, albumId), eq(albums.adminId, adminId)),
    with: {
      settings: true,
    },
  });

  if (!album) {
    throw new Error("Album not found or access denied");
  }

  return album;
}
