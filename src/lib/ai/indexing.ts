import { inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { faces, images } from "@/lib/db/schema";

import { getAIService } from "./index";
import type { FaceIndexImage } from "./types";

export const PLACEHOLDER_BBOX = { x: 0, y: 0, width: 0, height: 0 };

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

  const imageIds = imagesToIndex.map((image) => image.imageId);

  // Neon HTTP has no interactive transactions, so we use a batch transaction:
  // lock image rows first, then conditionally insert missing placeholder faces.
  await db.batch([
    db.execute(
      sql`SELECT ${images.id}
          FROM ${images}
          WHERE ${inArray(images.id, imageIds)}
          FOR UPDATE`,
    ),
    db.execute(sql`
      INSERT INTO faces (image_id, bbox, confidence)
      SELECT
        v.image_id::uuid,
        v.bbox::jsonb,
        v.confidence::real
      FROM (
        VALUES ${sql.join(
          imagesToIndex.map((image) => {
            const result = resultsByImageId.get(image.imageId);
            const confidence = (result?.facesIndexed ?? 0) > 0 ? 1 : 0;
            return sql`(${image.imageId}, ${JSON.stringify(PLACEHOLDER_BBOX)}, ${confidence})`;
          }),
          sql`, `,
        )}
      ) AS v(image_id, bbox, confidence)
      WHERE NOT EXISTS (
        SELECT 1
        FROM faces f
        WHERE f.image_id = v.image_id::uuid
      )
    `),
  ]);

  const existingFaces = await db
    .select({ imageId: faces.imageId })
    .from(faces)
    .where(inArray(faces.imageId, imageIds));

  if (existingFaces.length !== imageIds.length) {
    throw new Error(
      "Failed to create or locate placeholder face rows for indexed images.",
    );
  }
}
