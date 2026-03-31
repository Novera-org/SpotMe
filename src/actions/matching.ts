"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import {
  searchSessions,
  matchResults,
  images,
  albums,
  faces,
} from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireIdentity } from "@/lib/auth/identity";
import { getAIService } from "@/lib/ai";
import {
  startSearchSchema,
} from "@/lib/validations/search";
import { IMAGE_STATUS, SEARCH_STATUS } from "@/config/constants";
import { logActivity } from "@/lib/activity";
import { indexAlbumImages, PLACEHOLDER_BBOX } from "@/lib/ai/indexing";
import { processLogger } from "@/lib/logger";
import {
  enforceFreeTierRateLimitForIdentity,
  FREE_TIER_RATE_LIMIT_BUCKET,
} from "@/lib/rate-limit";

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

  if (identity.userId) {
    return false;
  }

  return false;
}

// ─── Start Search Session ────────────────────────────────────────

export async function startSearchSession(albumId: string) {
  const parsed = startSearchSchema.safeParse({ albumId });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const identity = await requireIdentity();
  await enforceFreeTierRateLimitForIdentity(
    identity,
    FREE_TIER_RATE_LIMIT_BUCKET.USER_SEARCH_SESSION,
  );

  // Fetch album with settings to get maxSelfies
  const album = await db.query.albums.findFirst({
    where: eq(albums.id, parsed.data.albumId),
    with: { settings: true },
  });

  if (!album) {
    return { error: "Album not found" };
  }

  const maxSelfies = album.settings?.maxSelfies ?? 3;

  const [session] = await db
    .insert(searchSessions)
    .values({
      albumId: parsed.data.albumId,
      userId: identity.userId,
      guestId: identity.guestId,
      status: SEARCH_STATUS.UPLOADING,
    })
    .returning({ id: searchSessions.id });

  // Log search activity
  await logActivity({
    albumId: parsed.data.albumId,
    action: "search_started",
    actorType: identity.type,
    actorId: identity.userId || identity.guestId || undefined,
  });

  return { sessionId: session.id, maxSelfies };
}

// ─── Request Selfie Upload URL ───────────────────────────────────

export async function requestSelfieUploadUrl(input: {
  searchSessionId: string;
  filename: string;
  contentType: string;
  fileSize: number;
}) {
  void input;
  return {
    error:
      "Direct selfie upload URLs are disabled. Upload selfies through the backend route instead.",
  };
}

// ─── Run Matching ────────────────────────────────────────────────

export async function runMatching(searchSessionId: string) {
  // 1. Validate UUID format
  const uuidParse = z.string().uuid().safeParse(searchSessionId);
  if (!uuidParse.success) {
    return { error: "Invalid search session ID" };
  }

  const identity = await requireIdentity();

  // 2. Validate session exists, belongs to the current caller, and fetch selfies for matching
  const session = await db.query.searchSessions.findFirst({
    where: eq(searchSessions.id, searchSessionId),
    with: { selfies: true },
  });

  if (!session || !isSearchSessionOwnedByIdentity(session, identity)) {
    return { error: "Search session not found" };
  }

  await enforceFreeTierRateLimitForIdentity(
    identity,
    FREE_TIER_RATE_LIMIT_BUCKET.USER_MATCHING,
  );

  // Update status to matching
  await db
    .update(searchSessions)
    .set({ status: SEARCH_STATUS.MATCHING })
    .where(eq(searchSessions.id, searchSessionId));

  try {
    if (session.selfies.length === 0) {
      await db
        .update(searchSessions)
        .set({ status: SEARCH_STATUS.FAILED })
        .where(eq(searchSessions.id, searchSessionId));
      return { error: "No selfies found for this session" };
    }

    const aiService = getAIService();

    const readyAlbumImages = await db
      .select({
        id: images.id,
        r2Url: images.r2Url,
      })
      .from(images)
      .where(
        and(
          eq(images.albumId, session.albumId),
          eq(images.status, IMAGE_STATUS.READY),
        ),
      );

    if (readyAlbumImages.length === 0) {
      await db
        .update(searchSessions)
        .set({
          status: SEARCH_STATUS.COMPLETED,
          completedAt: new Date(),
        })
        .where(eq(searchSessions.id, searchSessionId));

      return { matchCount: 0, sessionId: searchSessionId };
    }

    const readyImageIds = new Set(readyAlbumImages.map((image) => image.id));

    const existingAlbumFaces = await db
      .select({
        imageId: faces.imageId,
      })
      .from(faces)
      .where(inArray(faces.imageId, readyAlbumImages.map((image) => image.id)));

    const indexedImageIds = new Set(
      existingAlbumFaces.map((face) => face.imageId),
    );
    const unindexedImages = readyAlbumImages.filter(
      (image) => !indexedImageIds.has(image.id),
    );

    if (unindexedImages.length > 0) {
      await indexAlbumImages(
        session.albumId,
        unindexedImages.map((image) => ({
          imageId: image.id,
          imageUrl: image.r2Url,
        })),
      );
    }

    // Run matching for each selfie
    const allMatches: Array<{
      searchSelfieId: string;
      imageId: string;
      similarityScore: number;
    }> = [];

    for (const selfie of session.selfies) {
      const results = await aiService.findMatches({
        selfieUrl: selfie.r2Url,
        albumId: session.albumId,
      });

      for (const result of results) {
        if (!readyImageIds.has(result.imageId)) {
          continue;
        }

        allMatches.push({
          searchSelfieId: selfie.id,
          imageId: result.imageId,
          similarityScore: result.similarityScore,
        });
      }
    }

    // Deduplicate: keep highest similarity per imageId
    const bestMatches = new Map<string, (typeof allMatches)[number]>();
    for (const match of allMatches) {
      const existing = bestMatches.get(match.imageId);
      if (!existing || match.similarityScore > existing.similarityScore) {
        bestMatches.set(match.imageId, match);
      }
    }

    // Insert match results
    const matchValues = Array.from(bestMatches.values());
    if (matchValues.length > 0) {
      const existingFaces = await db
        .select({
          id: faces.id,
          imageId: faces.imageId,
        })
        .from(faces)
        .where(inArray(faces.imageId, matchValues.map((match) => match.imageId)));

      const faceIdsByImageId = new Map<string, string>();
      for (const face of existingFaces) {
        if (!faceIdsByImageId.has(face.imageId)) {
          faceIdsByImageId.set(face.imageId, face.id);
        }
      }

      const missingFaceRows = matchValues
        .filter((match) => !faceIdsByImageId.has(match.imageId))
        .map((match) => ({
          imageId: match.imageId,
          bbox: PLACEHOLDER_BBOX,
          confidence: match.similarityScore,
        }));

      if (missingFaceRows.length > 0) {
        await db
          .insert(faces)
          .values(missingFaceRows)
          .onConflictDoNothing({ target: faces.imageId });

        // Re-query ALL faces for the current match set to ensure faceIdsByImageId
        // is complete, covering rows that existed before AND those just inserted
        // (or inserted by a concurrent run).
        const allRelevantFaces = await db
          .select({
            id: faces.id,
            imageId: faces.imageId,
          })
          .from(faces)
          .where(inArray(faces.imageId, matchValues.map((match) => match.imageId)));

        for (const face of allRelevantFaces) {
          faceIdsByImageId.set(face.imageId, face.id);
        }
      }

      const resolvedMatches: Array<
        (typeof matchValues)[number] & { faceId: string }
      > = [];
      const unresolvedImageIds: string[] = [];
      for (const match of matchValues) {
        const faceId = faceIdsByImageId.get(match.imageId);
        if (!faceId) {
          unresolvedImageIds.push(match.imageId);
          continue;
        }
        resolvedMatches.push({ ...match, faceId });
      }

      if (unresolvedImageIds.length > 0) {
        processLogger.error("[runMatching] Missing face mapping for match images", {
          searchSessionId,
          albumId: session.albumId,
          unresolvedImageIds,
        });
        throw new Error("Missing face mapping for one or more matched images.");
      }

      await db.insert(matchResults).values(
        resolvedMatches.map((match) => ({
          searchSessionId,
          searchSelfieId: match.searchSelfieId,
          imageId: match.imageId,
          faceId: match.faceId,
          similarityScore: match.similarityScore,
        })),
      );
    }

    // Update status to completed
    await db
      .update(searchSessions)
      .set({
        status: SEARCH_STATUS.COMPLETED,
        completedAt: new Date(),
      })
      .where(eq(searchSessions.id, searchSessionId));

    // Log match activity if matches were found
    if (matchValues.length > 0) {
      await logActivity({
        albumId: session.albumId,
        action: "match_found",
        actorType: session.userId ? "user" : "guest",
        actorId: session.userId || session.guestId || undefined,
        metadata: { matchCount: matchValues.length },
      });
    }

    return { matchCount: matchValues.length, sessionId: searchSessionId };
  } catch (error) {
    try {
      await db
        .update(searchSessions)
        .set({ status: SEARCH_STATUS.FAILED })
        .where(eq(searchSessions.id, searchSessionId));
    } catch (statusUpdateError) {
      processLogger.error("[runMatching] Failed to update session status", {
        searchSessionId,
        albumId: session.albumId,
        error:
          statusUpdateError instanceof Error
            ? {
                name: statusUpdateError.name,
                message: statusUpdateError.message,
                stack: statusUpdateError.stack,
              }
            : { name: "UnknownError", message: String(statusUpdateError) },
      });
    }

    processLogger.error("[runMatching] Matching failed", {
      searchSessionId,
      albumId: session.albumId,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : { name: "UnknownError", message: String(error) },
    });

    return {
      error: "Matching failed. Please try again.",
    };
  }
}

// ─── Get Match Results ───────────────────────────────────────────

export async function getMatchResults(searchSessionId: string) {
  const identity = await requireIdentity();
  const searchSession = await db.query.searchSessions.findFirst({
    where: eq(searchSessions.id, searchSessionId),
    columns: {
      id: true,
      userId: true,
      guestId: true,
    },
  });

  if (!searchSession || !isSearchSessionOwnedByIdentity(searchSession, identity)) {
    return [];
  }

  const results = await db.query.matchResults.findMany({
    where: eq(matchResults.searchSessionId, searchSessionId),
    with: {
      image: true,
    },
    orderBy: [desc(matchResults.similarityScore)],
  });

  return results.map((r) => ({
    matchResult: {
      id: r.id,
      similarityScore: r.similarityScore,
      createdAt: r.createdAt,
    },
    image: {
      id: r.image.id,
      r2Url: r.image.r2Url,
      filename: r.image.filename,
    },
  }));
}

// ─── Get Search Session ──────────────────────────────────────────

export async function getSearchSession(sessionId: string) {
  const identity = await requireIdentity();
  const session = await db.query.searchSessions.findFirst({
    where: eq(searchSessions.id, sessionId),
  });

  if (!session || !isSearchSessionOwnedByIdentity(session, identity)) {
    return null;
  }

  return session;
}
