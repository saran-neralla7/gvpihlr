import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";
import prisma from "./prisma";
import { RoleType } from "@prisma/client";

const COOKIE_NAME = "gvpihlr_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours
const SECRET = process.env.AUTH_SECRET || "gvpihlr_fallback_secret_key_minimum_32_chars_2026";

export interface SessionPayload {
  userId: string;
  username: string;
  fullName: string;
  roles: RoleType[];
  facultyId?: string | null;
  studentId?: string | null;
  departmentId?: string | null;
  schoolId?: string | null;
  exp: number;
}

/**
 * Sign a session payload using HMAC-SHA256
 */
export function signSession(payload: SessionPayload): string {
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Verify and decode an HMAC-signed session string
 */
export function verifySession(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(base64Data)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Hash password securely
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 12);
}

/**
 * Verify password
 */
export async function verifyPassword(
  plainText: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Set the session cookie in Server Action / Route Handler
 */
export async function setSessionCookie(payload: SessionPayload) {
  const token = signSession(payload);
  const cookieStore = cookies();
  const isHttps = process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL?.includes("localhost");
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = cookies();
  const isHttps = process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL?.includes("localhost");
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get the current verified session from HTTP-only cookie
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Load full user context including database roles and profiles
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId, isActive: true },
    include: {
      userRoles: {
        include: {
          role: true,
          school: true,
          department: true,
          program: true,
        },
      },
      facultyProfile: {
        include: {
          department: {
            include: {
              school: true,
            },
          },
        },
      },
      studentProfile: {
        include: {
          enrollments: {
            where: { isCurrent: true },
            include: {
              program: true,
              section: true,
              academicYear: true,
            },
          },
        },
      },
    },
  });

  return user;
}
