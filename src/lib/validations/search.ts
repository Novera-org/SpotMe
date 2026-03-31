import { z } from "zod";

export const ACCEPTED_SELFIE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const MAX_SELFIE_SIZE = 10 * 1024 * 1024; // 10MB

export const startSearchSchema = z.object({
  albumId: z.uuid({ message: "Invalid album ID" }),
});

export const uploadSelfieSchema = z.object({
  searchSessionId: z.uuid({ message: "Invalid session ID" }),
  filename: z.string().min(1, "Filename is required"),
  contentType: z.enum(ACCEPTED_SELFIE_TYPES, {
    message: "Only JPEG, PNG, and WebP images are allowed",
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_SELFIE_SIZE, "File must be under 10MB"),
});

export type StartSearchInput = z.infer<typeof startSearchSchema>;
export type UploadSelfieInput = z.infer<typeof uploadSelfieSchema>;
