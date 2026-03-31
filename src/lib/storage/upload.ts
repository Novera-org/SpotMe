import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
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

interface DirectUploadParams extends PresignedUploadParams {
  body: Uint8Array;
}

function buildR2UploadTarget(albumId: string, filename: string) {
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
  const r2Key = `albums/${albumId}/${nanoid(16)}.${ext}`;
  const baseUrl = R2_PUBLIC_URL.endsWith("/")
    ? R2_PUBLIC_URL.slice(0, -1)
    : R2_PUBLIC_URL;
  const r2Url = `${baseUrl}/${r2Key}`;

  return { r2Key, r2Url };
}

/**
 * Generate a presigned PUT URL for direct client-to-R2 upload.
 * Key pattern: albums/{albumId}/{nanoid(16)}.{ext}
 */
export async function generatePresignedUploadUrl(
  params: PresignedUploadParams,
): Promise<PresignedUploadResult> {
  const { albumId, filename, contentType } = params;
  const { r2Key, r2Url } = buildR2UploadTarget(albumId, filename);

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

export async function uploadObjectToR2(
  params: DirectUploadParams,
): Promise<{ r2Key: string; r2Url: string }> {
  const { albumId, filename, contentType, body } = params;
  const { r2Key, r2Url } = buildR2UploadTarget(albumId, filename);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    ContentType: contentType,
    Body: body,
  });

  await r2Client.send(command);

  return { r2Key, r2Url };
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
/**
 * Fetch object metadata from R2 for verification.
 */
export async function getObjectMetadata(r2Key: string) {
  const command = new HeadObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
  });

  try {
    const response = await r2Client.send(command);
    return {
      contentLength: response.ContentLength,
      contentType: response.ContentType,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "NotFound") {
      return null;
    }
    throw error;
  }
}
