import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { images } from "./images";
import { albums } from "./albums";
import { user } from "./auth";
import { guests } from "./guests";

export const downloads = pgTable("downloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  guestId: uuid("guest_id").references(() => guests.id, {
    onDelete: "set null",
  }),
  downloadType: text("download_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
