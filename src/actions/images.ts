"use server";

import { db } from "@/lib/db";
import { images, imageMetadata } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { verifyAlbumOwnership } from "@/actions/albums";
import {
  uploadImageSchema,
  imageMetadataSchema,
} from "@/lib/validations/images";
import { generatePresignedUploadUrl, deleteFromR2 } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { albums } from "@/lib/db/schema";

// ─── Types ───────────────────────────────────────────────────────

interface FileInfo {
  albumId: string;
  filename: string;
  contentType: string;
  fileSize: number;
}

interface UploadUrlResult {
  imageId: string;
  uploadUrl: string;
  r2Key: string;
  r2Url: string;
  filename: string;
}

// ─── Request Upload URLs ─────────────────────────────────────────

const MAX_BATCH_SIZE = 50;

export async function requestUploadUrls(fileInfos: FileInfo[]) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  if (fileInfos.length === 0) {
    throw new Error("No files provided");
  }

  if (fileInfos.length > MAX_BATCH_SIZE) {
    throw new Error(`Maximum ${MAX_BATCH_SIZE} files per batch`);
  }

  // All files must belong to the same album
  const albumId = fileInfos[0].albumId;
  if (!fileInfos.every((f) => f.albumId === albumId)) {
    throw new Error("All files must belong to the same album");
  }

  // Verify album ownership
  await verifyAlbumOwnership(albumId, adminId);

  // Validate each file
  for (const file of fileInfos) {
    const parsed = uploadImageSchema.safeParse(file);
    if (!parsed.success) {
      throw new Error(
        `Invalid file "${file.filename}": ${parsed.error.issues[0].message}`
      );
    }
  }

  // Generate presigned URLs and create DB records
  const results: UploadUrlResult[] = [];

  for (const file of fileInfos) {
    const { uploadUrl, r2Key, r2Url } = await generatePresignedUploadUrl({
      albumId: file.albumId,
      filename: file.filename,
      contentType: file.contentType,
    });

    const [imageRecord] = await db
      .insert(images)
      .values({
        albumId: file.albumId,
        r2Key,
        r2Url,
        filename: file.filename,
        status: "uploading",
      })
      .returning({ id: images.id });

    results.push({
      imageId: imageRecord.id,
      uploadUrl,
      r2Key,
      r2Url,
      filename: file.filename,
    });
  }

  return results;
}

// ─── Confirm Upload ──────────────────────────────────────────────

export async function confirmUpload(input: {
  imageId: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  const parsed = imageMetadataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Verify admin ownership via join: images → albums
  const [image] = await db
    .select({
      id: images.id,
      albumId: images.albumId,
      adminId: albums.adminId,
    })
    .from(images)
    .innerJoin(albums, eq(images.albumId, albums.id))
    .where(
      and(eq(images.id, parsed.data.imageId), eq(albums.adminId, adminId))
    );

  if (!image) {
    throw new Error("Image not found or access denied");
  }

  // Update image status to "ready"
  await db
    .update(images)
    .set({ status: "ready", updatedAt: new Date() })
    .where(eq(images.id, parsed.data.imageId));

  // Create image metadata row
  await db.insert(imageMetadata).values({
    imageId: parsed.data.imageId,
    width: parsed.data.width,
    height: parsed.data.height,
    fileSize: parsed.data.fileSize,
    mimeType: parsed.data.mimeType,
  });

  revalidatePath(`/dashboard/albums/${image.albumId}`);
}

// ─── Delete Image ────────────────────────────────────────────────

export async function deleteImage(imageId: string) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify ownership via join
  const [image] = await db
    .select({
      id: images.id,
      r2Key: images.r2Key,
      albumId: images.albumId,
    })
    .from(images)
    .innerJoin(albums, eq(images.albumId, albums.id))
    .where(and(eq(images.id, imageId), eq(albums.adminId, adminId)));

  if (!image) {
    throw new Error("Image not found or access denied");
  }

  // Delete from R2 — don't block on errors
  try {
    await deleteFromR2(image.r2Key);
  } catch {
    // R2 deletion failed, but proceed with DB cleanup
  }

  // Delete from DB (cascade removes metadata, faces, etc.)
  await db.delete(images).where(eq(images.id, imageId));

  revalidatePath(`/dashboard/albums/${image.albumId}`);
}

// ─── Get Album Images ────────────────────────────────────────────

export async function getAlbumImages(
  albumId: string,
  limit: number = 24,
  offset: number = 0
) {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Verify album ownership
  await verifyAlbumOwnership(albumId, adminId);

  return db
    .select()
    .from(images)
    .where(eq(images.albumId, albumId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(images.createdAt));
}
