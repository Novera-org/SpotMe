import { db } from "@/lib/db";
import { images, faces } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { IMAGE_STATUS } from "@/config/constants";
import type { AIFaceService, FaceMatchRequest, FaceMatchResult } from "./types";

/**
 * Mock implementation of AIFaceService.
 * Returns random album images as "matches" with fake similarity scores.
 * Creates real `faces` rows to satisfy the FK constraint on `matchResults.faceId`.
 *
 * Will be replaced by HFSpacesFaceService when the real AI service is ready.
 */
export class MockFaceService implements AIFaceService {
  async findMatches(request: FaceMatchRequest): Promise<FaceMatchResult[]> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get all "ready" images from the album
    const albumImages = await db
      .select({ id: images.id })
      .from(images)
      .where(
        and(
          eq(images.albumId, request.albumId),
          eq(images.status, IMAGE_STATUS.READY),
        ),
      );

    if (albumImages.length === 0) return [];

    // Randomly select 20-40% of images as "matches"
    const matchPercentage = 0.2 + Math.random() * 0.2;
    const matchCount = Math.max(
      1,
      Math.round(albumImages.length * matchPercentage),
    );

    // Shuffle and take the first N
    const shuffled = [...albumImages].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, matchCount);

    // Create fake face rows and build results
    const results: FaceMatchResult[] = [];

    for (const img of selected) {
      // Create a real `faces` row so the FK on matchResults is satisfied
      const [faceRow] = await db
        .insert(faces)
        .values({
          imageId: img.id,
          bbox: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 0.99,
        })
        .returning({ id: faces.id });

      results.push({
        imageId: img.id,
        faceId: faceRow.id,
        similarityScore:
          Math.round((0.6 + Math.random() * 0.38) * 100) / 100,
      });
    }

    return results;
  }
}
