import { and, eq, sql } from "drizzle-orm";

import { USER_ROLE } from "@/config/constants";
import { type Session } from "@/lib/auth";
import type { Identity } from "@/lib/auth/identity";
import { db } from "@/lib/db";
import { requestRateLimits } from "@/lib/db/schema";

export type FreeTierRateLimitAudience = "user" | "event-holder";

export const FREE_TIER_RATE_LIMIT_BUCKET = {
  USER_SEARCH_SESSION: "free-tier:user-search-session",
  USER_SELFIE_UPLOAD: "free-tier:user-selfie-upload",
  USER_MATCHING: "free-tier:user-matching",
  USER_DOWNLOAD: "free-tier:user-download",
  EVENT_HOLDER_UPLOAD: "free-tier:event-holder-upload",
} as const;

type FreeTierRateLimitBucket =
  (typeof FREE_TIER_RATE_LIMIT_BUCKET)[keyof typeof FREE_TIER_RATE_LIMIT_BUCKET];

type RateLimitPolicy = {
  maxRequests: number;
  windowMs: number;
};

type ConsumeRateLimitInput = {
  namespace: FreeTierRateLimitBucket;
  subjectKey: string;
  maxRequests: number;
  windowMs: number;
};

export class RateLimitExceededError extends Error {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitExceededError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const FREE_TIER_RATE_LIMITS: Record<
  FreeTierRateLimitAudience,
  RateLimitPolicy
> = {
  user: {
    maxRequests: 5,
    windowMs: 60_000,
  },
  "event-holder": {
    maxRequests: 1,
    windowMs: 60_000,
  },
};

function getAudienceForRole(role: string | null | undefined): FreeTierRateLimitAudience {
  return role === USER_ROLE.ADMIN ? "event-holder" : "user";
}

function getRateLimitMessage(audience: FreeTierRateLimitAudience) {
  if (audience === "event-holder") {
    return "Free event holder accounts are limited to 1 request per minute for this action. Please wait a moment and try again.";
  }

  return "Free users are limited to 5 requests per minute for this action. Please wait a moment and try again.";
}

function getRetryAfterSeconds(windowStartedAt: Date, windowMs: number, now: number) {
  const retryAfterMs = windowStartedAt.getTime() + windowMs - now;
  return Math.max(1, Math.ceil(retryAfterMs / 1000));
}

async function consumeRateLimit({
  namespace,
  subjectKey,
  maxRequests,
  windowMs,
}: ConsumeRateLimitInput) {
  const now = new Date();
  const windowResetThreshold = new Date(now.getTime() - windowMs);

  const result = await db.execute(sql`
    insert into "request_rate_limits" (
      "namespace",
      "subject_key",
      "request_count",
      "window_started_at",
      "updated_at"
    )
    values (${namespace}, ${subjectKey}, 1, ${now}, ${now})
    on conflict ("namespace", "subject_key")
    do update set
      "request_count" = case
        when "request_rate_limits"."window_started_at" <= ${windowResetThreshold} then 1
        else "request_rate_limits"."request_count" + 1
      end,
      "window_started_at" = case
        when "request_rate_limits"."window_started_at" <= ${windowResetThreshold} then ${now}
        else "request_rate_limits"."window_started_at"
      end,
      "updated_at" = ${now}
    where
      "request_rate_limits"."window_started_at" <= ${windowResetThreshold}
      or "request_rate_limits"."request_count" < ${maxRequests}
    returning
      "request_count" as request_count,
      "window_started_at" as window_started_at
  `);

  const insertedOrUpdatedRow = result.rows[0] as
    | {
        request_count: number;
        window_started_at: Date;
      }
    | undefined;

  if (insertedOrUpdatedRow) {
    return {
      allowed: true as const,
      retryAfterSeconds: 0,
      remaining: Math.max(0, maxRequests - insertedOrUpdatedRow.request_count),
    };
  }

  const [existingBucket] = await db
    .select({
      requestCount: requestRateLimits.requestCount,
      windowStartedAt: requestRateLimits.windowStartedAt,
    })
    .from(requestRateLimits)
    .where(
      and(
        eq(requestRateLimits.namespace, namespace),
        eq(requestRateLimits.subjectKey, subjectKey),
      ),
    )
    .limit(1);

  const retryAfterSeconds = existingBucket
    ? getRetryAfterSeconds(existingBucket.windowStartedAt, windowMs, now.getTime())
    : Math.ceil(windowMs / 1000);

  return {
    allowed: false as const,
    retryAfterSeconds,
    remaining: 0,
  };
}

function getSubjectKeyForIdentity(identity: Identity) {
  if (identity.userId) {
    return `user:${identity.userId}`;
  }

  if (!identity.guestId) {
    throw new Error("Missing guest identity for rate limiting.");
  }

  return `guest:${identity.guestId}`;
}

async function enforceFreeTierRateLimit(input: {
  audience: FreeTierRateLimitAudience;
  bucket: FreeTierRateLimitBucket;
  subjectKey: string;
}) {
  const policy = FREE_TIER_RATE_LIMITS[input.audience];
  const result = await consumeRateLimit({
    namespace: input.bucket,
    subjectKey: input.subjectKey,
    maxRequests: policy.maxRequests,
    windowMs: policy.windowMs,
  });

  if (!result.allowed) {
    throw new RateLimitExceededError(
      getRateLimitMessage(input.audience),
      result.retryAfterSeconds,
    );
  }
}

export async function enforceFreeTierRateLimitForIdentity(
  identity: Identity,
  bucket: FreeTierRateLimitBucket,
) {
  await enforceFreeTierRateLimit({
    audience: getAudienceForRole(identity.role),
    bucket,
    subjectKey: getSubjectKeyForIdentity(identity),
  });
}

export async function enforceFreeTierRateLimitForSession(
  session: Session,
  bucket: FreeTierRateLimitBucket,
) {
  await enforceFreeTierRateLimit({
    audience: getAudienceForRole(session.user.role),
    bucket,
    subjectKey: `user:${session.user.id}`,
  });
}

export function isRateLimitExceededError(error: unknown): error is RateLimitExceededError {
  return error instanceof RateLimitExceededError;
}
