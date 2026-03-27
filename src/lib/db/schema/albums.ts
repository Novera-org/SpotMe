import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const albumSettings = pgTable("album_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .unique()
    .references(() => albums.id, { onDelete: "cascade" }),
  allowDownloads: boolean("allow_downloads").notNull().default(true),
  watermark: boolean("watermark").notNull().default(false),
  requireLogin: boolean("require_login").notNull().default(false),
  maxSelfies: integer("max_selfies").notNull().default(3),
  matchThreshold: real("match_threshold").notNull().default(0.6),
  linkExpiresAt: timestamp("link_expires_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  label: text("label"),
  isActive: boolean("is_active").notNull().default(true),
  accessCount: integer("access_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  expiresAt: timestamp("expires_at"),
});
