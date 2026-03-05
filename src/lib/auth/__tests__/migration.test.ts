import { describe, it, expect, mock } from "bun:test";

// Mock the low-level library
mock.module("@neondatabase/serverless", () => ({
  neon: () => () => ({}),
}));

// Mock getServerSession to be controllable
let mockSession: any = null;
mock.module("@/lib/auth/helpers", () => ({
  getServerSession: async () => {
    console.log("Mock getServerSession called, returning:", mockSession);
    return mockSession;
  },
}));

// Mock next/cache
mock.module("next/cache", () => ({
  revalidatePath: mock(() => {}),
}));

// Mock the guest service
let mockGuest: any = null;
mock.module("../guest", () => ({
  getCurrentGuest: async () => mockGuest,
  clearGuestCookie: async () => {
    console.log("Mock clearGuestCookie called");
  },
}));

// Mock db and transaction
const txMock = {
  update: mock(() => ({
    set: mock(() => ({
      where: mock(() => ({
        returning: mock(async () => [1, 2, 3]), // Simulate 3 items
      })),
    })),
  })),
  delete: mock(() => ({
    where: mock(async () => {}),
  })),
};

mock.module("@/lib/db", () => ({
  db: {
    transaction: mock(async (callback: any) => {
      console.log("Mock db.transaction called");
      return await callback(txMock);
    }),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(async () => []), 
        })),
      })),
    })),
  },
}));

// Mock the schema
mock.module("@/lib/db/schema", () => ({
  guests: {},
  searchSessions: {},
  downloads: {},
}));

import { migrateGuestToUser } from "../../../actions/guests";

describe("Transactional Guest Migration", () => {
  it("should fail if no user is authenticated", async () => {
    mockSession = null;
    const result = await migrateGuestToUser();
    expect(result.migrated).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should succeed and perform updates inside transaction if authenticated", async () => {
    mockSession = { user: { id: "real-user-id" } };
    mockGuest = { id: "test-guest-id" };
    const result = await migrateGuestToUser();
    
    expect(result.migrated).toBe(true);
    expect(result.searchSessionsMigrated).toBe(3);
    expect(result.downloadsMigrated).toBe(3);
    
    // Verify transaction was used
    // expect(db.transaction).toHaveBeenCalled(); // Bun doesn't have haveBeenCalled on modules easily here
  });
});
