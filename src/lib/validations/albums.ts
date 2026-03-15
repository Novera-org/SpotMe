import { z } from "zod";
import { ALBUM_STATUS } from "@/config/constants";

// ─── Create Album ────────────────────────────────────────────────
export const createAlbumSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

// ─── Update Album ────────────────────────────────────────────────
export const updateAlbumSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  status: z
    .enum([ALBUM_STATUS.DRAFT, ALBUM_STATUS.ACTIVE, ALBUM_STATUS.ARCHIVED])
    .optional(),
});

// ─── Update Album Settings ───────────────────────────────────────
export const updateAlbumSettingsSchema = z.object({
  albumId: z.string().uuid(),
  allowDownloads: z.boolean().optional(),
  watermark: z.boolean().optional(),
  requireLogin: z.boolean().optional(),
  maxSelfies: z.number().int().min(1).max(10).optional(),
  matchThreshold: z.number().min(0.1).max(1.0).optional(),
  linkExpiresAt: z.date().nullable().optional(),
});

// ─── Create Share Link ───────────────────────────────────────────
export const createShareLinkSchema = z.object({
  albumId: z.string().uuid(),
  label: z.string().max(50, "Label must be at most 50 characters").optional().or(z.literal("")),
  expiresAt: z.date().nullable().optional(),
});

// ─── Inferred Types ──────────────────────────────────────────────
export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
export type UpdateAlbumSettingsInput = z.infer<typeof updateAlbumSettingsSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
