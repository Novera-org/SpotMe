"use server";

import { db } from "@/lib/db";
import {
  albums,
  images,
  searchSessions,
  matchResults,
  downloads,
  activityLog,
} from "@/lib/db/schema";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/helpers";

// ─── Types ───────────────────────────────────────────────────────

interface AlbumStat {
  albumId: string;
  title: string;
  status: string;
  visibility: "public" | "private";
  imageCount: number;
  searchCount: number;
  matchCount: number;
  downloadCount: number;
  createdAt: Date;
}

interface RecentActivity {
  action: string;
  actorType: string;
  albumTitle: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalAlbums: number;
  totalImages: number;
  totalSearches: number;
  totalDownloads: number;
  albumStats: AlbumStat[];
  recentActivity: RecentActivity[];
}

// ─── Get Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireAdmin();
  const adminId = session.user.id;

  // Fetch all admin albums
  const adminAlbums = await db.query.albums.findMany({
    where: eq(albums.adminId, adminId),
    columns: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
    with: {
      settings: {
        columns: {
          requireLogin: true,
        },
      },
    },
    orderBy: [desc(albums.createdAt)],
  });

  if (adminAlbums.length === 0) {
    return {
      totalAlbums: 0,
      totalImages: 0,
      totalSearches: 0,
      totalDownloads: 0,
      albumStats: [],
      recentActivity: [],
    };
  }

  const albumIds = adminAlbums.map((a) => a.id);

  // Per-album image counts
  const imageCounts = await db
    .select({
      albumId: images.albumId,
      count: sql<number>`count(*)`,
    })
    .from(images)
    .where(inArray(images.albumId, albumIds))
    .groupBy(images.albumId);

  // Per-album search counts
  const searchCounts = await db
    .select({
      albumId: searchSessions.albumId,
      count: sql<number>`count(*)`,
    })
    .from(searchSessions)
    .where(inArray(searchSessions.albumId, albumIds))
    .groupBy(searchSessions.albumId);

  // Per-album match counts (through searchSessions)
  const matchCounts = await db
    .select({
      albumId: searchSessions.albumId,
      count: sql<number>`count(*)`,
    })
    .from(matchResults)
    .innerJoin(
      searchSessions,
      eq(matchResults.searchSessionId, searchSessions.id)
    )
    .where(inArray(searchSessions.albumId, albumIds))
    .groupBy(searchSessions.albumId);

  // Per-album download counts (through images)
  const downloadCounts = await db
    .select({
      albumId: images.albumId,
      count: sql<number>`count(*)`,
    })
    .from(downloads)
    .innerJoin(images, eq(downloads.imageId, images.id))
    .where(inArray(images.albumId, albumIds))
    .groupBy(images.albumId);

  // Build lookup maps
  const imageMap = new Map(imageCounts.map((r) => [r.albumId, Number(r.count)]));
  const searchMap = new Map(searchCounts.map((r) => [r.albumId, Number(r.count)]));
  const matchMap = new Map(matchCounts.map((r) => [r.albumId, Number(r.count)]));
  const downloadMap = new Map(downloadCounts.map((r) => [r.albumId, Number(r.count)]));

  // Build per-album stats
  const albumStats: AlbumStat[] = adminAlbums.map((album) => ({
    albumId: album.id,
    title: album.title,
    status: album.status,
    visibility: (album.settings?.requireLogin ?? true) ? "private" : "public",
    imageCount: imageMap.get(album.id) ?? 0,
    searchCount: searchMap.get(album.id) ?? 0,
    matchCount: matchMap.get(album.id) ?? 0,
    downloadCount: downloadMap.get(album.id) ?? 0,
    createdAt: album.createdAt,
  }));

  // Aggregate totals
  const totalImages = albumStats.reduce((sum, a) => sum + a.imageCount, 0);
  const totalSearches = albumStats.reduce((sum, a) => sum + a.searchCount, 0);
  const totalDownloads = albumStats.reduce((sum, a) => sum + a.downloadCount, 0);

  // Recent activity (last 20 entries across admin's albums)
  const recentRows = await db
    .select({
      action: activityLog.action,
      actorType: activityLog.actorType,
      albumTitle: albums.title,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .innerJoin(albums, eq(activityLog.albumId, albums.id))
    .where(inArray(activityLog.albumId, albumIds))
    .orderBy(desc(activityLog.createdAt))
    .limit(20);

  return {
    totalAlbums: adminAlbums.length,
    totalImages,
    totalSearches,
    totalDownloads,
    albumStats,
    recentActivity: recentRows,
  };
}
