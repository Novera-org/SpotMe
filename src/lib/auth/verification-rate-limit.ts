type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const EMAIL_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_LIMIT_MAX_ATTEMPTS = 3;
const IP_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT_MAX_ATTEMPTS = 10;

const emailBuckets = new Map<string, RateLimitBucket>();
const ipBuckets = new Map<string, RateLimitBucket>();

function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

function pruneExpiredBuckets(store: Map<string, RateLimitBucket>, now: number) {
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

function consumeAttempt(
  store: Map<string, RateLimitBucket>,
  key: string,
  maxAttempts: number,
  windowMs: number,
  now: number,
) {
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxAttempts) {
    return false;
  }

  current.count += 1;
  store.set(key, current);
  return true;
}

export function checkVerificationEmailRateLimit(
  email: string,
  requestHeaders: Headers,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const clientIp = getClientIp(requestHeaders);
  const now = Date.now();

  pruneExpiredBuckets(emailBuckets, now);
  pruneExpiredBuckets(ipBuckets, now);

  const emailAllowed = consumeAttempt(
    emailBuckets,
    normalizedEmail,
    EMAIL_LIMIT_MAX_ATTEMPTS,
    EMAIL_LIMIT_WINDOW_MS,
    now,
  );
  if (!emailAllowed) {
    return false;
  }

  const ipAllowed = consumeAttempt(
    ipBuckets,
    clientIp,
    IP_LIMIT_MAX_ATTEMPTS,
    IP_LIMIT_WINDOW_MS,
    now,
  );

  if (!ipAllowed) {
    const emailBucket = emailBuckets.get(normalizedEmail);
    if (emailBucket) {
      if (emailBucket.count <= 1) {
        emailBuckets.delete(normalizedEmail);
      } else {
        emailBucket.count -= 1;
        emailBuckets.set(normalizedEmail, emailBucket);
      }
    }

    return false;
  }

  return true;
}
