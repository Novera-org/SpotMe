import {
  pgTable,
  uuid,
  text,
  timestamp,
  real,
  jsonb,
  check,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { albums } from "./albums";
import { user } from "./auth";
import { guests } from "./guests";
import { images, faces } from "./images";

export const searchSessions = pgTable(
  "search_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
    guestId: uuid("guest_id").references(() => guests.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("uploading"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    check(
      "user_or_guest",
      sql`(${table.userId} IS NOT NULL AND ${table.guestId} IS NULL) OR (${table.userId} IS NULL AND ${table.guestId} IS NOT NULL)`,
    ),
  ],
);

export const searchSelfies = pgTable("search_selfies", {
  id: uuid("id").primaryKey().defaultRandom(),
  searchSessionId: uuid("search_session_id")
    .notNull()
    .references(() => searchSessions.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  r2Url: text("r2_url").notNull(),
  embedding: jsonb("embedding"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matchResults = pgTable("match_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  searchSessionId: uuid("search_session_id")
    .notNull()
    .references(() => searchSessions.id, { onDelete: "cascade" }),
  searchSelfieId: uuid("search_selfie_id")
    .notNull()
    .references(() => searchSelfies.id, { onDelete: "cascade" }),
  imageId: uuid("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  faceId: uuid("face_id")
    .notNull()
    .references(() => faces.id, { onDelete: "cascade" }),
  similarityScore: real("similarity_score").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const savedPhotos = pgTable(
  "saved_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id").references(() => guests.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("saved_photos_user_unique_idx")
      .on(table.albumId, table.imageId, table.userId)
      .where(sql`${table.userId} IS NOT NULL`),
    uniqueIndex("saved_photos_guest_unique_idx")
      .on(table.albumId, table.imageId, table.guestId)
      .where(sql`${table.guestId} IS NOT NULL`),
    check(
      "saved_user_or_guest",
      sql`(${table.userId} IS NOT NULL AND ${table.guestId} IS NULL) OR (${table.userId} IS NULL AND ${table.guestId} IS NOT NULL)`,
    ),
  ],
);
