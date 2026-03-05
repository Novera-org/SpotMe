"use server";

import { db } from "@/lib/db";
import { user, albums, searchSessions, images, downloads } from "@/lib/db/schema";
import { requireIdentity, getCurrentIdentity } from "@/lib/auth/identity";
import { eq } from "drizzle-orm";

function ensureTestDataAllowed() {
  const isDev = process.env.NODE_ENV === "development";
  const isAllowed = process.env.ALLOW_TEST_DATA === "true";

  console.log(`[test-data] Environment check: NODE_ENV=${process.env.NODE_ENV}, ALLOW_TEST_DATA=${process.env.ALLOW_TEST_DATA}, isDev=${isDev}, isAllowed=${isAllowed}`);

  if (!isDev && !isAllowed) {
    throw new Error("UNAUTHORIZED: Test data creation is disabled in this environment.");
  }
}

export async function createTestData() {
  // 0. Environment Guard
  ensureTestDataAllowed();

  // 1. Get current identity (guest or user)
  const identity = await requireIdentity();

  // 2. Identity Guard: Only allow if it's a dev environment OR if user is already an admin
  // (In dev, we allow anyone to trigger it to bootstrap the first admin)
  if (process.env.NODE_ENV !== "development") {
    const sessionUser = await db.query.user.findFirst({
      where: eq(user.id, identity.userId || ""),
    });
    if (sessionUser?.role !== "admin") {
      throw new Error("UNAUTHORIZED: Only administrators can generate test data in non-development environments.");
    }
  }
  
  // 3. Ensure an admin user exists to own an album
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

  // 4. Ensure an album exists
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

  // 5. Create a search session for the current identity
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
  // 0. Environment Guard
  ensureTestDataAllowed();

  const identity = await requireIdentity();
  
  // 2. Identity Guard (similar to above)
  if (process.env.NODE_ENV !== "development") {
    const sessionUser = await db.query.user.findFirst({
      where: eq(user.id, identity.userId || ""),
    });
    if (sessionUser?.role !== "admin") {
      throw new Error("UNAUTHORIZED: Only administrators can generate test data in non-development environments.");
    }
  }

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
