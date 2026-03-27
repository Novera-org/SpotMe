"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import {
  searchSessions,
  searchSelfies,
  matchResults,
  images,
  albums,
  albumSettings,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireIdentity } from "@/lib/auth/identity";
import { generatePresignedUploadUrl } from "@/lib/storage/upload";
import { getAIService } from "@/lib/ai";
import {
  startSearchSchema,
  uploadSelfieSchema,
} from "@/lib/validations/search";
import { SEARCH_STATUS } from "@/config/constants";

// ─── Start Search Session ────────────────────────────────────────

export async function startSearchSession(albumId: string) {
  const parsed = startSearchSchema.safeParse({ albumId });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const identity = await requireIdentity();

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

  return { sessionId: session.id, maxSelfies };
}

// ─── Request Selfie Upload URL ───────────────────────────────────

export async function requestSelfieUploadUrl(input: {
  searchSessionId: string;
  filename: string;
  contentType: string;
  fileSize: number;
}) {
  const parsed = uploadSelfieSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Verify session exists
  const session = await db.query.searchSessions.findFirst({
    where: eq(searchSessions.id, parsed.data.searchSessionId),
  });

  if (!session) {
    return { error: "Search session not found" };
  }

  // Generate presigned URL with selfies/ prefix
  const { uploadUrl, r2Key, r2Url } = await generatePresignedUploadUrl({
    albumId: `selfies/${session.albumId}`,
    filename: parsed.data.filename,
    contentType: parsed.data.contentType,
  });

  // Create selfie record
  const [selfie] = await db
    .insert(searchSelfies)
    .values({
      searchSessionId: session.id,
      r2Key,
      r2Url,
    })
    .returning({ id: searchSelfies.id });

  return { selfieId: selfie.id, uploadUrl };
}

// ─── Run Matching ────────────────────────────────────────────────

export async function runMatching(searchSessionId: string) {
  // 1. Validate UUID format
  const uuidParse = z.string().uuid().safeParse(searchSessionId);
  if (!uuidParse.success) {
    return { error: "Invalid search session ID" };
  }

  // 2. Validate session exists and fetch selfies for matching
  const session = await db.query.searchSessions.findFirst({
    where: eq(searchSessions.id, searchSessionId),
    with: { selfies: true },
  });

  if (!session) {
    return { error: "Search session not found" };
  }

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

    // Run matching for each selfie
    const allMatches: Array<{
      searchSelfieId: string;
      imageId: string;
      faceId: string;
      similarityScore: number;
    }> = [];

    for (const selfie of session.selfies) {
      const results = await aiService.findMatches({
        selfieUrl: selfie.r2Url,
        albumId: session.albumId,
      });

      for (const result of results) {
        allMatches.push({
          searchSelfieId: selfie.id,
          imageId: result.imageId,
          faceId: result.faceId,
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
      for (const match of matchValues) {
        await db.insert(matchResults).values({
          searchSessionId,
          searchSelfieId: match.searchSelfieId,
          imageId: match.imageId,
          faceId: match.faceId,
          similarityScore: match.similarityScore,
        });
      }
    }

    // Update status to completed
    await db
      .update(searchSessions)
      .set({
        status: SEARCH_STATUS.COMPLETED,
        completedAt: new Date(),
      })
      .where(eq(searchSessions.id, searchSessionId));

    return { matchCount: matchValues.length, sessionId: searchSessionId };
  } catch (error) {
    await db
      .update(searchSessions)
      .set({ status: SEARCH_STATUS.FAILED })
      .where(eq(searchSessions.id, searchSessionId));
    return { error: "Matching failed. Please try again." };
  }
}

// ─── Get Match Results ───────────────────────────────────────────

export async function getMatchResults(searchSessionId: string) {
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
  return (
    db.query.searchSessions.findFirst({
      where: eq(searchSessions.id, sessionId),
    }) ?? null
  );
}
