import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireIdentity } from "@/lib/auth/identity";
import { db } from "@/lib/db";
import { searchSelfies, searchSessions } from "@/lib/db/schema";
import { processLogger, redactId } from "@/lib/logger";
import {
  enforceFreeTierRateLimitForIdentity,
  FREE_TIER_RATE_LIMIT_BUCKET,
  isRateLimitExceededError,
} from "@/lib/rate-limit";
import {
  MAX_SELFIE_SIZE,
  uploadSelfieSchema,
} from "@/lib/validations/search";
import { deleteFromR2, uploadObjectToR2 } from "@/lib/storage/upload";

const MULTIPART_OVERHEAD_BYTES = 256 * 1024;
const MAX_MULTIPART_BODY_SIZE = MAX_SELFIE_SIZE + MULTIPART_OVERHEAD_BYTES;

function normalizeMimeType(mimeType: string | null | undefined) {
  if (!mimeType) {
    return null;
  }

  const normalized = mimeType.trim().toLowerCase();
  if (normalized === "image/jpg") {
    return "image/jpeg";
  }

  return normalized;
}

function detectAllowedImageMimeType(fileBytes: Uint8Array) {
  if (
    fileBytes.length >= 3 &&
    fileBytes[0] === 0xff &&
    fileBytes[1] === 0xd8 &&
    fileBytes[2] === 0xff
  ) {
    return "image/jpeg" as const;
  }

  if (
    fileBytes.length >= 8 &&
    fileBytes[0] === 0x89 &&
    fileBytes[1] === 0x50 &&
    fileBytes[2] === 0x4e &&
    fileBytes[3] === 0x47 &&
    fileBytes[4] === 0x0d &&
    fileBytes[5] === 0x0a &&
    fileBytes[6] === 0x1a &&
    fileBytes[7] === 0x0a
  ) {
    return "image/png" as const;
  }

  if (
    fileBytes.length >= 12 &&
    fileBytes[0] === 0x52 &&
    fileBytes[1] === 0x49 &&
    fileBytes[2] === 0x46 &&
    fileBytes[3] === 0x46 &&
    fileBytes[8] === 0x57 &&
    fileBytes[9] === 0x45 &&
    fileBytes[10] === 0x42 &&
    fileBytes[11] === 0x50
  ) {
    return "image/webp" as const;
  }

  return null;
}

function isSearchSessionOwnedByIdentity(
  session: {
    userId: string | null;
    guestId: string | null;
  },
  identity: {
    userId: string | null;
    guestId: string | null;
  },
) {
  if (identity.userId && session.userId === identity.userId) {
    return true;
  }

  if (identity.guestId && session.guestId === identity.guestId) {
    return true;
  }

  return false;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  let resolvedSessionId = "unknown";

  try {
    const identity = await requireIdentity();
    const { sessionId } = await params;
    resolvedSessionId = sessionId;
    const parsedSessionId = z.string().uuid().safeParse(sessionId);
    if (!parsedSessionId.success) {
      return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
    }

    const session = await db.query.searchSessions.findFirst({
      where: eq(searchSessions.id, parsedSessionId.data),
    });

    if (!session || !isSearchSessionOwnedByIdentity(session, identity)) {
      return NextResponse.json({ error: "Search session not found." }, { status: 404 });
    }

    await enforceFreeTierRateLimitForIdentity(
      identity,
      FREE_TIER_RATE_LIMIT_BUCKET.USER_SELFIE_UPLOAD,
    );

    const contentLengthHeader = request.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BODY_SIZE) {
        return NextResponse.json(
          { error: "File must be under 10MB." },
          { status: 413 },
        );
      }
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "Selfie file is required." }, { status: 400 });
    }

    const fileBytes = new Uint8Array(await uploadedFile.arrayBuffer());
    const detectedMimeType = detectAllowedImageMimeType(fileBytes);
    if (!detectedMimeType) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 },
      );
    }

    const claimedMimeType = normalizeMimeType(uploadedFile.type);
    if (claimedMimeType && claimedMimeType !== detectedMimeType) {
      return NextResponse.json(
        { error: "Uploaded file content does not match its declared image type." },
        { status: 400 },
      );
    }

    const parsed = uploadSelfieSchema.safeParse({
      searchSessionId: sessionId,
      filename: uploadedFile.name,
      contentType: detectedMimeType,
      fileSize: uploadedFile.size,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid selfie upload." },
        { status: 400 },
      );
    }

    const { r2Key, r2Url } = await uploadObjectToR2({
      albumId: `selfies/${session.albumId}`,
      filename: uploadedFile.name,
      contentType: detectedMimeType,
      body: fileBytes,
    });

    let selfie;
    try {
      [selfie] = await db
        .insert(searchSelfies)
        .values({
          searchSessionId: session.id,
          r2Key,
          r2Url,
        })
        .returning({ id: searchSelfies.id });
    } catch (error) {
      try {
        await deleteFromR2(r2Key);
      } catch (cleanupError) {
        processLogger.error("[selfie-upload] Failed to clean up orphaned R2 object", {
          sessionId: redactId(session.id),
          r2Key,
          error:
            cleanupError instanceof Error
              ? cleanupError.message
              : String(cleanupError),
        });
      }

      throw error;
    }

    return NextResponse.json({ selfieId: selfie.id }, { status: 201 });
  } catch (error) {
    if (isRateLimitExceededError(error)) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: {
            "Retry-After": error.retryAfterSeconds.toString(),
          },
        },
      );
    }

    processLogger.error("[selfie-upload] Unexpected upload failure", {
      sessionId: redactId(resolvedSessionId),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : { message: String(error) },
    });

    return NextResponse.json(
      { error: "We couldn't upload your selfie right now. Please try again." },
      { status: 500 },
    );
  }
}
