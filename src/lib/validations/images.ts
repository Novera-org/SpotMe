import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadImageSchema = z.object({
  albumId: z.uuid(),
  filename: z.string().min(1),
  contentType: z.enum(ACCEPTED_IMAGE_TYPES, {
    message: "Only JPEG, PNG, and WebP images are allowed",
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "File must be under 10MB"),
});

export const imageMetadataSchema = z.object({
  imageId: z.uuid(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type ImageMetadataInput = z.infer<typeof imageMetadataSchema>;

export const imageIdSchema = z.uuid({ message: "Invalid image ID" });
export const albumIdSchema = z.uuid({ message: "Invalid album ID" });

export const getAlbumImagesSchema = z.object({
  albumId: albumIdSchema,
  limit: z.number().int().min(1).max(100).default(24),
  offset: z.number().int().min(0).default(0),
});
