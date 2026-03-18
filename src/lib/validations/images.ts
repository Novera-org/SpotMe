import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadImageSchema = z.object({
  albumId: z.string().uuid(),
  filename: z.string().min(1),
  contentType: z.enum(ACCEPTED_IMAGE_TYPES, {
    message: "Only JPEG, PNG, and WebP images are allowed",
  }),
  fileSize: z.number().max(MAX_FILE_SIZE, "File must be under 10MB"),
});

export const imageMetadataSchema = z.object({
  imageId: z.string().uuid(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type ImageMetadataInput = z.infer<typeof imageMetadataSchema>;
