import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { guests } from "./guests";
import { albums, albumSettings, shareLinks } from "./albums";
import { images, imageMetadata, faces, faceEmbeddings } from "./images";
import { searchSessions, searchSelfies, matchResults, savedPhotos } from "./search";
import { downloads, activityLog } from "./analytics";

// ─── Auth Relations ──────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  albums: many(albums),
  searchSessions: many(searchSessions),
  downloads: many(downloads),
  savedPhotos: many(savedPhotos),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// ─── Guest Relations ─────────────────────────────────────────────

export const guestRelations = relations(guests, ({ many }) => ({
  searchSessions: many(searchSessions),
  downloads: many(downloads),
  savedPhotos: many(savedPhotos),
}));

// ─── Album Relations ─────────────────────────────────────────────

export const albumRelations = relations(albums, ({ one, many }) => ({
  admin: one(user, { fields: [albums.adminId], references: [user.id] }),
  settings: one(albumSettings),
  shareLinks: many(shareLinks),
  images: many(images),
  searchSessions: many(searchSessions),
  activityLog: many(activityLog),
  savedPhotos: many(savedPhotos),
}));

export const albumSettingsRelations = relations(albumSettings, ({ one }) => ({
  album: one(albums, {
    fields: [albumSettings.albumId],
    references: [albums.id],
  }),
}));

export const shareLinkRelations = relations(shareLinks, ({ one }) => ({
  album: one(albums, {
    fields: [shareLinks.albumId],
    references: [albums.id],
  }),
}));

// ─── Image Relations ─────────────────────────────────────────────

export const imageRelations = relations(images, ({ one, many }) => ({
  album: one(albums, { fields: [images.albumId], references: [albums.id] }),
  metadata: one(imageMetadata),
  faces: many(faces),
  matchResults: many(matchResults),
  downloads: many(downloads),
  savedPhotos: many(savedPhotos),
}));

export const imageMetadataRelations = relations(imageMetadata, ({ one }) => ({
  image: one(images, {
    fields: [imageMetadata.imageId],
    references: [images.id],
  }),
}));

export const faceRelations = relations(faces, ({ one, many }) => ({
  image: one(images, { fields: [faces.imageId], references: [images.id] }),
  embedding: one(faceEmbeddings),
  matchResults: many(matchResults),
}));

export const faceEmbeddingRelations = relations(faceEmbeddings, ({ one }) => ({
  face: one(faces, {
    fields: [faceEmbeddings.faceId],
    references: [faces.id],
  }),
}));

// ─── Search Relations ────────────────────────────────────────────

export const searchSessionRelations = relations(
  searchSessions,
  ({ one, many }) => ({
    album: one(albums, {
      fields: [searchSessions.albumId],
      references: [albums.id],
    }),
    user: one(user, {
      fields: [searchSessions.userId],
      references: [user.id],
    }),
    guest: one(guests, {
      fields: [searchSessions.guestId],
      references: [guests.id],
    }),
    selfies: many(searchSelfies),
    matchResults: many(matchResults),
  }),
);

export const searchSelfieRelations = relations(
  searchSelfies,
  ({ one, many }) => ({
    searchSession: one(searchSessions, {
      fields: [searchSelfies.searchSessionId],
      references: [searchSessions.id],
    }),
    matchResults: many(matchResults),
  }),
);

export const matchResultRelations = relations(matchResults, ({ one }) => ({
  searchSession: one(searchSessions, {
    fields: [matchResults.searchSessionId],
    references: [searchSessions.id],
  }),
  searchSelfie: one(searchSelfies, {
    fields: [matchResults.searchSelfieId],
    references: [searchSelfies.id],
  }),
  image: one(images, {
    fields: [matchResults.imageId],
    references: [images.id],
  }),
  face: one(faces, { fields: [matchResults.faceId], references: [faces.id] }),
}));

export const savedPhotoRelations = relations(savedPhotos, ({ one }) => ({
  album: one(albums, {
    fields: [savedPhotos.albumId],
    references: [albums.id],
  }),
  image: one(images, {
    fields: [savedPhotos.imageId],
    references: [images.id],
  }),
  user: one(user, { fields: [savedPhotos.userId], references: [user.id] }),
  guest: one(guests, {
    fields: [savedPhotos.guestId],
    references: [guests.id],
  }),
}));

// ─── Analytics Relations ─────────────────────────────────────────

export const downloadRelations = relations(downloads, ({ one }) => ({
  image: one(images, {
    fields: [downloads.imageId],
    references: [images.id],
  }),
  user: one(user, { fields: [downloads.userId], references: [user.id] }),
  guest: one(guests, {
    fields: [downloads.guestId],
    references: [guests.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  album: one(albums, {
    fields: [activityLog.albumId],
    references: [albums.id],
  }),
}));
