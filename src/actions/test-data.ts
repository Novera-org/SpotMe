"use server";

import { db } from "@/lib/db";
import { user, albums, searchSessions, images, downloads } from "@/lib/db/schema";
import { requireIdentity, getCurrentIdentity } from "@/lib/auth/identity";
import { eq } from "drizzle-orm";

export async function createTestData() {
  // 1. Get current identity (guest or user)
  const identity = await requireIdentity();
  
  // 2. Ensure an admin user exists to own an album
  let adminUser = await db.query.user.findFirst({
    where: eq(user.role, "admin"),
  });

  if (!adminUser) {
    [adminUser] = await db
      .insert(user)
      .values({
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
      })
      .returning();
  }

  // 3. Ensure an album exists
  let testAlbum = await db.query.albums.findFirst();

  if (!testAlbum) {
    [testAlbum] = await db
      .insert(albums)
      .values({
        adminId: adminUser.id,
        title: "Test Album",
        slug: "test-album",
        status: "active",
      })
      .returning();
  }

  // 4. Create a search session for the current identity
  const [newSession] = await db
    .insert(searchSessions)
    .values({
      albumId: testAlbum.id,
      userId: identity.userId,
      guestId: identity.guestId,
      status: "completed",
    })
    .returning();

  return {
    success: true,
    sessionId: newSession.id,
    identityType: identity.type,
  };
}

export async function createDownloadTestData() {
  const identity = await requireIdentity();
  
  let adminUser = await db.query.user.findFirst({ where: eq(user.role, "admin") });
  if (!adminUser) {
    [adminUser] = await db.insert(user).values({ name: "Test Admin", email: "admin@test.com", role: "admin" }).returning();
  }

  let testAlbum = await db.query.albums.findFirst();
  if (!testAlbum) {
    [testAlbum] = await db.insert(albums).values({ adminId: adminUser.id, title: "Test Album", slug: "test-album", status: "active" }).returning();
  }

  let testImage = await db.query.images.findFirst({ where: eq(images.albumId, testAlbum.id) });
  if (!testImage) {
    [testImage] = await db.insert(images).values({
      albumId: testAlbum.id,
      r2Key: "test-key",
      r2Url: "https://example.com/test.jpg",
      filename: "test.jpg",
      status: "ready",
    }).returning();
  }

  const [newDownload] = await db
    .insert(downloads)
    .values({
      imageId: testImage.id,
      userId: identity.userId,
      guestId: identity.guestId,
      downloadType: "original",
    })
    .returning();

  return {
    success: true,
    downloadId: newDownload.id,
    identityType: identity.type,
  };
}

export async function getSessionData() {
  const identity = await getCurrentIdentity();
  
  if (!identity) {
    return {
      type: "none",
      userId: null,
      guestId: null,
      sessions: [],
      downloads: [],
    };
  }
  
  const sessions = await db.query.searchSessions.findMany({
    where: (table, { eq }) => 
      identity.userId 
        ? eq(table.userId, identity.userId)
        : eq(table.guestId, identity.guestId!),
    with: {
      album: true,
    }
  });

  const downloadRecords = await db.query.downloads.findMany({
    where: (table, { eq }) => 
      identity.userId 
        ? eq(table.userId, identity.userId)
        : eq(table.guestId, identity.guestId!),
    with: {
      image: true,
    }
  });

  return {
    type: identity.type,
    userId: identity.userId,
    guestId: identity.guestId,
    sessions,
    downloads: downloadRecords,
  };
}
