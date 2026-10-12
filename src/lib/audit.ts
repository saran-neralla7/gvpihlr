import prisma from "./prisma";

export interface LogAuditOptions {
  userId?: string | null;
  action: string;
  description?: string | null;
  resource: string;
  resourceId?: string | null;
  status?: "SUCCESS" | "FAILURE";
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Parse client user agent to identify Device type, Operating System, and Browser.
 */
export function parseDevice(ua: string | null | undefined): {
  deviceType: "Mobile" | "Tablet" | "Desktop" | "Bot" | "Unknown";
  os: string;
  browser: string;
  summary: string;
} {
  if (!ua || ua === "Unknown" || ua.trim() === "") {
    return {
      deviceType: "Unknown",
      os: "Unknown OS",
      browser: "Unknown Browser",
      summary: "Unknown Device",
    };
  }

  const uaLower = ua.toLowerCase();

  // 1. Detect Device Type
  let deviceType: "Mobile" | "Tablet" | "Desktop" | "Bot" | "Unknown" = "Desktop";
  if (uaLower.includes("bot") || uaLower.includes("crawler") || uaLower.includes("spider")) {
    deviceType = "Bot";
  } else if (uaLower.includes("ipad") || uaLower.includes("tablet") || (uaLower.includes("android") && !uaLower.includes("mobile"))) {
    deviceType = "Tablet";
  } else if (uaLower.includes("mobi") || uaLower.includes("iphone") || uaLower.includes("ipod") || uaLower.includes("android")) {
    deviceType = "Mobile";
  }

  // 2. Detect Operating System
  let os = "Unknown OS";
  if (uaLower.includes("macintosh") || uaLower.includes("mac os x")) {
    os = "macOS";
  } else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ios")) {
    os = "iOS";
  } else if (uaLower.includes("windows nt 10") || uaLower.includes("windows nt 11") || uaLower.includes("windows")) {
    os = "Windows";
  } else if (uaLower.includes("android")) {
    os = "Android";
  } else if (uaLower.includes("linux")) {
    os = "Linux";
  } else if (uaLower.includes("cros")) {
    os = "ChromeOS";
  }

  // 3. Detect Browser
  let browser = "Web Browser";
  if (uaLower.includes("edg/")) {
    browser = "Microsoft Edge";
  } else if (uaLower.includes("chrome") && !uaLower.includes("edg/")) {
    browser = "Google Chrome";
  } else if (uaLower.includes("safari") && !uaLower.includes("chrome")) {
    browser = "Apple Safari";
  } else if (uaLower.includes("firefox")) {
    browser = "Mozilla Firefox";
  } else if (uaLower.includes("opera") || uaLower.includes("opr/")) {
    browser = "Opera";
  }

  const summary = `${os} • ${browser} (${deviceType})`;

  return { deviceType, os, browser, summary };
}

/**
 * Extract Client IP and Device from Request Headers
 */
export function extractClientInfo(req: Request): {
  ipAddress: string;
  userAgent: string;
  deviceSummary: string;
} {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "127.0.0.1";

  const userAgent = req.headers.get("user-agent") || "Unknown Device";
  const { summary } = parseDevice(userAgent);

  return { ipAddress, userAgent, deviceSummary: summary };
}

/**
 * Record a security and compliance audit log entry with IP address and device fingerprint.
 * Filters out passwords, tokens, and secrets from details.
 */
export async function recordAuditLog(options: LogAuditOptions) {
  try {
    const rawDetails: Record<string, unknown> = options.details ? { ...options.details } : {};

    if (options.description && !rawDetails.description) {
      rawDetails.description = options.description;
    }

    if (options.userAgent && !rawDetails.device) {
      const parsed = parseDevice(options.userAgent);
      rawDetails.device = parsed.summary;
      rawDetails.os = parsed.os;
      rawDetails.browser = parsed.browser;
    }

    const sanitizedDetails = sanitizePayload(rawDetails);

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
    console.error("[CRITICAL] Failed to persist audit log:", error);
    return null;
  }
}

function sanitizePayload(obj: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = [
    "password",
    "passwordhash",
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
