"use server";

import { db } from "@/lib/db";
import { images, imageMetadata } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { verifyAlbumOwnership } from "@/actions/albums";
import {
  uploadImageSchema,
  imageMetadataSchema,
} from "@/lib/validations/images";
import { generatePresignedUploadUrl, deleteFromR2, getObjectMetadata } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { albums } from "@/lib/db/schema";
import { MAX_BATCH_SIZE } from "@/components/images/image-uploader/types";
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

  // 1. Generate all presigned URLs and collect metadata
  const uploadData = await Promise.all(
    fileInfos.map(async (file) => {
      const { uploadUrl, r2Key, r2Url } = await generatePresignedUploadUrl({
        albumId: file.albumId,
        filename: file.filename,
        contentType: file.contentType,
      });
      return { uploadUrl, r2Key, r2Url, filename: file.filename, albumId: file.albumId };
    })
  );

  // 2. Batch insert into database
  const insertedRows = await db
    .insert(images)
    .values(
      uploadData.map((data) => ({
        albumId: data.albumId,
        r2Key: data.r2Key,
        r2Url: data.r2Url,
        filename: data.filename,
        status: "uploading" as const,
      }))
    )
    .returning({ id: images.id });

  // 3. Map returned IDs back to the results
  return uploadData.map((data, index) => ({
    imageId: insertedRows[index].id,
    uploadUrl: data.uploadUrl,
    r2Key: data.r2Key,
    r2Url: data.r2Url,
    filename: data.filename,
  }));
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
  // 1. Fetch image to get r2Key
  const [image] = await db
    .select({
      id: images.id,
      albumId: images.albumId,
      adminId: albums.adminId,
      r2Key: images.r2Key,
    })
    .from(images)
    .innerJoin(albums, eq(images.albumId, albums.id))
    .where(
      and(eq(images.id, parsed.data.imageId), eq(albums.adminId, adminId))
    );

  if (!image) {
    throw new Error("Image not found or access denied");
  }

  // 2. Verify object in storage
  const storageMetadata = await getObjectMetadata(image.r2Key);

  if (!storageMetadata) {
    await db
      .update(images)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(images.id, image.id));
    throw new Error("File not found in storage. Please try uploading again.");
  }

  // 3. Verify size and type match
  if (
    storageMetadata.contentLength !== parsed.data.fileSize ||
    storageMetadata.contentType !== parsed.data.mimeType
  ) {
    await db
      .update(images)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(images.id, image.id));
    throw new Error(
      `Storage metadata mismatch (Size: ${storageMetadata.contentLength} vs ${parsed.data.fileSize}, Type: ${storageMetadata.contentType} vs ${parsed.data.mimeType})`
    );
  }

  // 4. Atomic batch for status update and metadata insertion
  // Note: neon-http doesn't support interactive transactions, but batch() is atomic
  await db.batch([
    db.update(images)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(images.id, parsed.data.imageId)),
    db.insert(imageMetadata)
      .values({
        imageId: parsed.data.imageId,
        width: parsed.data.width,
        height: parsed.data.height,
        fileSize: parsed.data.fileSize,
        mimeType: parsed.data.mimeType,
      })
      .onConflictDoNothing()
  ]);

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

  // 1. Delete from R2 - MUST succeed to proceed with DB cleanup
  try {
    await deleteFromR2(image.r2Key);
  } catch (error) {
    console.error(`[deleteImage] Failed to delete from R2: ${image.r2Key}`, error);
    throw new Error("Failed to delete the image from storage. The database record has been preserved.");
  }

  // 2. Delete from DB (cascade removes metadata, faces, etc.)
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
