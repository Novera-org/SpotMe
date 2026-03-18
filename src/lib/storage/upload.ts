import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "./r2";

interface PresignedUploadParams {
  albumId: string;
  filename: string;
  contentType: string;
}

interface PresignedUploadResult {
  uploadUrl: string;
  r2Key: string;
  r2Url: string;
}

/**
 * Generate a presigned PUT URL for direct client-to-R2 upload.
 * Key pattern: albums/{albumId}/{nanoid(16)}.{ext}
 */
export async function generatePresignedUploadUrl(
  params: PresignedUploadParams
): Promise<PresignedUploadResult> {
  const { albumId, filename, contentType } = params;

  // Extract file extension from the original filename
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const r2Key = `albums/${albumId}/${nanoid(16)}.${ext}`;
  const r2Url = `${R2_PUBLIC_URL}/${r2Key}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return { uploadUrl, r2Key, r2Url };
}

/**
 * Delete an object from R2 by its key.
 */
export async function deleteFromR2(r2Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
  });

  await r2Client.send(command);
}
