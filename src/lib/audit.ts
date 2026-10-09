import prisma from "./prisma";

export interface LogAuditOptions {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  status?: "SUCCESS" | "FAILURE";
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Record a security and compliance audit log entry.
 * Filters out passwords, tokens, and secrets from details.
 */
export async function recordAuditLog(options: LogAuditOptions) {
  try {
    const sanitizedDetails = options.details
      ? sanitizePayload(options.details)
      : null;

    return await prisma.auditLog.create({
      data: {
        userId: options.userId || null,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId || null,
        status: options.status || "SUCCESS",
        details: sanitizedDetails as any,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      },
    });
  } catch (error) {
    // Fail-safe: Audit logging failures must be logged to stderr without crashing transactions
    console.error("[CRITICAL] Failed to persist audit log:", error);
    return null;
  }
}

function sanitizePayload(obj: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = [
    "password",
    "passwordHash",
    "token",
    "secret",
    "auth",
    "cookie",
    "credit",
  ];
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      cleaned[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
