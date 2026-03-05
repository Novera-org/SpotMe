import { describe, it, expect, mock } from "bun:test";

// Mock the low-level library to prevent evaluation error
mock.module("@neondatabase/serverless", () => ({
  neon: () => () => ({}),
}));

// Mock next/headers
mock.module("next/headers", () => ({
  cookies: async () => ({
    get: mock(() => null),
    set: mock(() => {}),
    delete: mock(() => {}),
  }),
}));

// Mock nanoid
mock.module("nanoid", () => ({
  nanoid: () => "test-session-token-32-chars-long",
}));

// Mock the DB module
mock.module("@/lib/db", () => ({
  db: {
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(async () => [{ id: "test-guest-id", sessionToken: "test-session-token-32-chars-long" }]),
      })),
    })),
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(async () => []),
        })),
      })),
    })),
  },
}));

// Mock auth helpers
mock.module("@/lib/auth/helpers", () => ({
  getServerSession: async () => null,
}));

// Mock the auth module itself to prevent better-auth initialization
mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mock(async () => null),
    },
  },
}));

// Now import the functions to test
import { createGuest, getCurrentGuest } from "../guest";
import { requireIdentity, getCurrentIdentity } from "../identity";

describe("Guest System", () => {
    it("createGuest should create a new guest", async () => {
      const guest = await createGuest();
      expect(guest.id).toBe("test-guest-id");
      expect(guest.sessionToken).toBe("test-session-token-32-chars-long");
    });

    it("getCurrentGuest should return null if no cookie exists", async () => {
      const guest = await getCurrentGuest();
      expect(guest).toBeNull();
    });

    it("getCurrentIdentity should return null if neither user nor guest exists", async () => {
      const identity = await getCurrentIdentity();
      expect(identity).toBeNull();
    });

    it("requireIdentity should create a guest if not authenticated", async () => {
      const identity = await requireIdentity();
      expect(identity.type).toBe("guest");
      expect(identity.guestId).toBe("test-guest-id");
      expect(identity.userId).toBeNull();
    });
});
