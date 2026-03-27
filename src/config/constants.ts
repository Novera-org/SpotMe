export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "spotme";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ALBUM_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export const IMAGE_STATUS = {
  UPLOADING: "uploading",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
} as const;

export const SEARCH_STATUS = {
  UPLOADING: "uploading",
  MATCHING: "matching",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const USER_ROLE = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const MAX_SELFIES_DEFAULT = 3;
export const MATCH_THRESHOLD_DEFAULT = 0.6;
export const GUEST_SESSION_COOKIE = "guest_session";
export const GUEST_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
export const SHARE_LINK_RETENTION_DAYS = 30;
