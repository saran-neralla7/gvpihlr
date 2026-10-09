import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setSessionCookie, SessionPayload } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { LoginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // Lookup user by username, email, faculty shortName (e.g. KR, PS, VN), or student rollNumber
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { email: { equals: username, mode: "insensitive" } },
          { facultyProfile: { shortName: { equals: username, mode: "insensitive" } } },
          { studentProfile: { rollNumber: { equals: username, mode: "insensitive" } } },
        ],
        isActive: true,
      },
      include: {
        userRoles: {
          include: { role: true },
        },
        facultyProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      await recordAuditLog({
        action: "FAILED_LOGIN",
        resource: "User",
        resourceId: username,
        status: "FAILURE",
        details: { reason: "User not found or inactive", username },
      });
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Account temporarily locked due to multiple failed attempts. Please try again later.",
        },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      const failed = user.failedAttempts + 1;
      const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: failed,
          lockedUntil,
        },
      });

      await recordAuditLog({
        userId: user.id,
        action: "FAILED_LOGIN",
        resource: "User",
        resourceId: user.id,
        status: "FAILURE",
        details: { failedAttempts: failed, locked: !!lockedUntil },
      });

      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Reset failed attempts upon successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const roleNames = user.userRoles.map((ur) => ur.role.name);

    const sessionPayload: SessionPayload = {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      roles: roleNames,
      facultyId: user.facultyProfile?.id || null,
      studentId: user.studentProfile?.id || null,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600, // 12 hours
    };

    await setSessionCookie(sessionPayload);

    await recordAuditLog({
      userId: user.id,
      action: "LOGIN",
      resource: "User",
      resourceId: user.id,
      status: "SUCCESS",
      details: { roles: roleNames },
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        roles: roleNames,
      },
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
