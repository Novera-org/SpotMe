import { z } from "zod";
import { ALBUM_STATUS } from "@/config/constants";

// ─── Create Album ────────────────────────────────────────────────
export const createAlbumSchema = z.object({
  title: z
    .string()
    .max(100, "Title must be at most 100 characters")
    .refine((s) => s.trim().length >= 2, "Title must be at least 2 non-whitespace characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .refine((s) => s === "" || s.trim().length > 0, "Description cannot be only whitespace")
    .optional(),
});

// ─── Update Album ────────────────────────────────────────────────
export const updateAlbumSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .max(100, "Title must be at most 100 characters")
    .refine((s) => s.trim().length >= 2, "Title must be at least 2 non-whitespace characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .refine((s) => s === "" || s.trim().length > 0, "Description cannot be only whitespace")
    .optional(),
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
  label: z
    .string()
    .max(50, "Label must be at most 50 characters")
    .refine((s) => s === "" || s.trim().length > 0, "Label cannot be only whitespace")
    .optional(),
  expiresAt: z.date().nullable().optional(),
});

// ─── Inferred Types ──────────────────────────────────────────────
export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
export type UpdateAlbumSettingsInput = z.infer<typeof updateAlbumSettingsSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
