BEGIN;

LOCK TABLE "faces" IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE "match_results" IN SHARE ROW EXCLUSIVE MODE;

WITH ranked_faces AS (
  SELECT
    "id",
    "image_id",
    FIRST_VALUE("id") OVER (
      PARTITION BY "image_id"
      ORDER BY "created_at" ASC, "id" ASC
    ) AS "keep_id"
  FROM "faces"
),
duplicate_faces AS (
  SELECT "id", "image_id", "keep_id"
  FROM ranked_faces
  WHERE "id" <> "keep_id"
)
UPDATE "match_results" AS mr
SET "face_id" = df."keep_id"
FROM duplicate_faces AS df
WHERE mr."face_id" = df."id";

WITH ranked_faces AS (
  SELECT
    "id",
    FIRST_VALUE("id") OVER (
      PARTITION BY "image_id"
      ORDER BY "created_at" ASC, "id" ASC
    ) AS "keep_id"
  FROM "faces"
),
duplicate_faces AS (
  SELECT "id"
  FROM ranked_faces
  WHERE "id" <> "keep_id"
)
DELETE FROM "faces" AS f
USING duplicate_faces AS df
WHERE f."id" = df."id";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'faces_image_id_unique'
      AND conrelid = 'faces'::regclass
  ) THEN
    ALTER TABLE "faces"
      ADD CONSTRAINT "faces_image_id_unique" UNIQUE ("image_id");
  END IF;
END
$$;

COMMIT;
