import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireIdentity } from "@/lib/auth/identity";
import { db } from "@/lib/db";
import { searchSelfies, searchSessions } from "@/lib/db/schema";
import { processLogger, redactId } from "@/lib/logger";
import {
  enforceFreeTierRateLimitForIdentity,
  FREE_TIER_RATE_LIMIT_BUCKET,
  isRateLimitExceededError,
} from "@/lib/rate-limit";
import { uploadSelfieSchema } from "@/lib/validations/search";
import { deleteFromR2, uploadObjectToR2 } from "@/lib/storage/upload";

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
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "Selfie file is required." }, { status: 400 });
    }

    const parsed = uploadSelfieSchema.safeParse({
      searchSessionId: sessionId,
      filename: uploadedFile.name,
      contentType: uploadedFile.type,
      fileSize: uploadedFile.size,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid selfie upload." },
        { status: 400 },
      );
    }

    const session = await db.query.searchSessions.findFirst({
      where: eq(searchSessions.id, parsed.data.searchSessionId),
    });

    if (!session || !isSearchSessionOwnedByIdentity(session, identity)) {
      return NextResponse.json({ error: "Search session not found." }, { status: 404 });
    }

    await enforceFreeTierRateLimitForIdentity(
      identity,
      FREE_TIER_RATE_LIMIT_BUCKET.USER_SELFIE_UPLOAD,
    );

    const fileBytes = new Uint8Array(await uploadedFile.arrayBuffer());
    const { r2Key, r2Url } = await uploadObjectToR2({
      albumId: `selfies/${session.albumId}`,
      filename: uploadedFile.name,
      contentType: uploadedFile.type,
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
