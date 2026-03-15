import { config } from "dotenv";
config({ path: ".env.local" });
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ALBUM_STATUS } from "@/config/constants";

// Mock the low-level library to prevent evaluation error in src/lib/db/index.ts
mock.module("@neondatabase/serverless", () => ({
  neon: () => () => ({}),
}));

mock.module("drizzle-orm/neon-http", () => ({
  drizzle: () => ({}),
}));

mock.module("next/headers", () => ({
  headers: async () => new Headers(),
}));

mock.module("next/cache", () => ({
  revalidatePath: mock(() => {}),
}));

const mockRedirect = mock((path: string) => {
  throw new Error(`Redirected to ${path}`); 
});
mock.module("next/navigation", () => ({
  redirect: mockRedirect,
}));

mock.module("nanoid", () => ({
  nanoid: (size?: number) => size === 6 ? "test6" : "test10char",
}));

mock.module("slugify", () => ({
  default: mock((text: string) => text.toLowerCase().replace(/\s+/g, "-")),
}));

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

// Mock DB
const mockDb = {
  insert: mock(() => ({
    values: mock(() => ({
      returning: mock(async () => [{ id: VALID_UUID, slug: "test-title-test6" }]),
    })),
  })),
  update: mock(() => ({
    set: mock(() => ({
      where: mock(() => ({
        returning: mock(async () => [{ id: VALID_UUID }]),
      })),
    })),
  })),
  delete: mock(() => ({
    where: mock(async () => {}),
  })),
  select: mock(() => ({
    from: mock(() => ({
      innerJoin: mock(() => ({
          where: mock(async () => [{ albumId: VALID_UUID }]),
      })),
      where: mock(async () => []), // Default empty
    })),
  })),
  query: {
    albums: {
      findMany: mock(async () => []),
      findFirst: mock(async () => null),
    },
    shareLinks: {
      findMany: mock(async () => []),
    }
  },
};

mock.module("@/lib/db", () => ({
  db: mockDb,
}));

// Mock Auth Helpers
const mockUser = { id: "admin-id", role: "admin" };
mock.module("@/lib/auth/helpers", () => ({
  requireAdmin: async () => ({ user: mockUser }),
}));

// ─── Imports ─────────────────────────────────────────────────────

import { createAlbum, updateAlbum, deleteAlbum, getAdminAlbums, getAlbumById } from "../albums";
import { updateAlbumSettings } from "../album-settings";
import { createShareLink, deactivateShareLink, getAlbumShareLinks } from "../share-links";
import { getPublicAlbum, trackShareLinkAccess } from "../public-albums";

// ─── Tests ───────────────────────────────────────────────────────

describe("Albums & Sharing Actions", () => {
  beforeEach(() => {
    mock.restore();
    // Re-setup essential mock return values that might have been changed
    mockDb.select.mockImplementation(() => ({
        from: mock(() => ({
            where: mock(async () => [{ id: VALID_UUID, adminId: "admin-id" }]),
            innerJoin: mock(() => ({
                where: mock(async () => [{ albumId: VALID_UUID }]),
            })),
        })),
    }));
  });

  describe("Albums", () => {
    it("createAlbum should create an album and default settings", async () => {
      const formData = new FormData();
      formData.append("title", "Test Album");
      formData.append("description", "A test description");

      try {
        await createAlbum(formData);
      } catch (e: any) {
        if (!e.message.startsWith("Redirected")) throw e;
      }

      expect(mockDb.insert).toHaveBeenCalledTimes(2); // Album + Settings
      expect(mockRedirect).toHaveBeenCalledWith(`/dashboard/albums/${VALID_UUID}`);
    });

    it("updateAlbum should verify ownership and update", async () => {
      const input = { id: VALID_UUID, title: "Updated Title" };
      await updateAlbum(input);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("deleteAlbum should verify ownership and delete", async () => {
      try {
        await deleteAlbum(VALID_UUID);
      } catch (e: any) {
        if (!e.message.startsWith("Redirected")) throw e;
      }
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("getAdminAlbums should return current admin albums", async () => {
      await getAdminAlbums();
      expect(mockDb.query.albums.findMany).toHaveBeenCalled();
    });
  });

  describe("Album Settings", () => {
    it("updateAlbumSettings should update settings", async () => {
      const input = { albumId: VALID_UUID, allowDownloads: false };
      await updateAlbumSettings(input);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("Share Links", () => {
    it("createShareLink should generate a link", async () => {
      const input = { albumId: VALID_UUID, label: "Guest List" };
      await createShareLink(input);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("deactivateShareLink should set isActive to false", async () => {
      await deactivateShareLink("link-id");
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("Public Actions", () => {
    it("getPublicAlbum should fetch active album by slug", async () => {
      // Mock findFirst for public album
      mockDb.query.albums.findFirst.mockResolvedValueOnce({ id: "test-id", status: ALBUM_STATUS.ACTIVE } as any);
      // Mock count
      mockDb.select.mockImplementationOnce(() => ({
          from: mock(() => ({
              where: mock(async () => [{ count: 5 }]),
          })),
      }) as any);

      const album = await getPublicAlbum("test-slug");
      expect(album).not.toBeNull();
      expect(album?.imageCount).toBe(5);
    });

    it("trackShareLinkAccess should increment counter", async () => {
      await trackShareLinkAccess("link-code");
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
