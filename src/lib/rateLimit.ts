import { NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Garbage collection of expired rate limit entries every 5 minutes
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGc = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastGc < GC_INTERVAL_MS) return;
  lastGc = now;

  const expirationThreshold = now - windowMs;
  rateLimitStore.forEach((record, key) => {
    record.timestamps = record.timestamps.filter((t: number) => t > expirationThreshold);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  });
}

export interface RateLimitOptions {
  /** Maximum number of allowed requests in the time window */
  maxRequests: number;
  /** Window duration in milliseconds (e.g. 60_000 for 1 minute) */
  windowMs: number;
  /** Custom error message returned when limit is exceeded */
  message?: string;
}

/**
 * Extracts client IP from standard proxy headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

/**
 * Checks and updates rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const windowStart = now - windowMs;

  cleanupExpiredRecords(windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: Math.max(1, resetTime),
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = maxRequests - record.timestamps.length;
  const resetTime = Math.ceil(windowMs / 1000);

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetTime,
  };
}

/**
 * Helper to apply rate limiting directly in an API route.
 * Returns null if allowed, or a 429 NextResponse if rate limit exceeded.
 */
export function enforceRateLimit(
  req: Request,
  routePrefix: string,
  options: RateLimitOptions
): NextResponse | null {
  const clientIp = getClientIp(req);
  const key = `${routePrefix}:${clientIp}`;

  const { allowed, limit, remaining, resetTime } = checkRateLimit(key, options);

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error:
          options.message ||
          `Rate limit exceeded. Too many requests. Please try again in ${resetTime} seconds.`,
        retryAfter: resetTime,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetTime),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetTime),
        },
      }
    );
  }

  return null;
}
