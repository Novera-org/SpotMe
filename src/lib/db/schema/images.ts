import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  jsonb,
} from "drizzle-orm/pg-core";
import { albums } from "./albums";

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  r2Url: text("r2_url").notNull(),
  filename: text("filename").notNull(),
  status: text("status").notNull().default("uploading"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const imageMetadata = pgTable("image_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .notNull()
    .unique()
    .references(() => images.id, { onDelete: "cascade" }),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  exifData: jsonb("exif_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const faces = pgTable("faces", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  bbox: jsonb("bbox").notNull(),
  confidence: real("confidence").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const faceEmbeddings = pgTable("face_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  faceId: uuid("face_id")
    .notNull()
    .unique()
    .references(() => faces.id, { onDelete: "cascade" }),
  embedding: jsonb("embedding").notNull(),
  modelVersion: text("model_version").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
