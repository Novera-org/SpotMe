import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { faces } from "@/lib/db/schema";

import { getAIService } from "./index";
import type { FaceIndexImage } from "./types";

const PLACEHOLDER_BBOX = { x: 0, y: 0, width: 0, height: 0 };

export async function indexAlbumImages(
  albumId: string,
  imagesToIndex: FaceIndexImage[],
) {
  if (imagesToIndex.length === 0) {
    return;
  }

  const results = await getAIService().indexImages({
    albumId,
    images: imagesToIndex,
  });

  const resultsByImageId = new Map(results.map((result) => [result.imageId, result]));

  for (const image of imagesToIndex) {
    if (!resultsByImageId.has(image.imageId)) {
      throw new Error("AI service did not confirm indexing for every image.");
    }
  }

  const existingFaces = await db
    .select({
      imageId: faces.imageId,
    })
    .from(faces)
    .where(inArray(faces.imageId, imagesToIndex.map((image) => image.imageId)));

  const existingImageIds = new Set(existingFaces.map((face) => face.imageId));
  const missingFaceRows = imagesToIndex
    .filter((image) => !existingImageIds.has(image.imageId))
    .map((image) => {
      const result = resultsByImageId.get(image.imageId);

      return {
        imageId: image.imageId,
        bbox: PLACEHOLDER_BBOX,
        // The external service owns the true embeddings, but we still need
        // a local face row for existing foreign keys and match records.
        confidence: (result?.facesIndexed ?? 0) > 0 ? 1 : 0,
      };
    });

  if (missingFaceRows.length > 0) {
    await db.insert(faces).values(missingFaceRows);
  }
}
