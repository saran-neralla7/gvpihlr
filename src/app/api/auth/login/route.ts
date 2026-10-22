import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { verifyPassword, setSessionCookie, SessionPayload } from "@/lib/auth";
import { recordAuditLog, extractClientInfo } from "@/lib/audit";
import { LoginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { ipAddress, userAgent, deviceSummary } = extractClientInfo(req);
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
        description: `Failed login attempt for unknown identifier: "${username}"`,
        resource: "User",
        resourceId: username,
        status: "FAILURE",
        ipAddress,
        userAgent,
        details: { reason: "User not found", username, device: deviceSummary },
      });
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check account active status
    if (!user.isActive) {
      await recordAuditLog({
        action: "FAILED_LOGIN",
        description: `Login blocked for deactivated account: "${username}"`,
        resource: "User",
        resourceId: user.id,
        status: "FAILURE",
        ipAddress,
        userAgent,
        details: { reason: "Account login disabled", username, device: deviceSummary },
      });
      return NextResponse.json(
        {
          success: false,
          error: user.studentProfile
            ? "Student portal logins are currently disabled by the administration. Please contact the administrative office."
            : "Your account has been deactivated. Please contact the administrator.",
        },
        { status: 403 }
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

    // Check Single-Device Concurrency for Students
    const isStudent = !!user.studentProfile;
    const forceTakeover = Boolean(body.forceTakeover);

    if (isStudent && user.activeSessionId && user.lastHeartbeatAt) {
      const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000);
      const isSessionActive = user.lastHeartbeatAt > twentyMinsAgo;

      if (isSessionActive && !forceTakeover) {
        return NextResponse.json(
          {
            success: false,
            requiresTakeover: true,
            activeDevice: user.activeDeviceSummary || "Another Device",
            activeSince: user.lastHeartbeatAt.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            error: `Active session detected on ${user.activeDeviceSummary || "another device"}.`,
          },
          { status: 409 }
        );
      }
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
        description: `Failed login attempt (Incorrect password) for user: ${user.username}`,
        resource: "User",
        resourceId: user.id,
        status: "FAILURE",
        ipAddress,
        userAgent,
        details: { failedAttempts: failed, locked: !!lockedUntil, device: deviceSummary },
      });

      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const newSessionId = crypto.randomUUID();

    // Reset failed attempts upon successful login & update active device
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        activeSessionId: isStudent ? newSessionId : undefined,
        activeDeviceSummary: isStudent ? deviceSummary : undefined,
        activeDeviceIp: isStudent ? ipAddress : undefined,
        lastHeartbeatAt: isStudent ? new Date() : undefined,
        sessionExpiresAt: isStudent ? new Date(Date.now() + 12 * 3600 * 1000) : undefined,
      },
    });

    // Record student activity telemetry
    if (isStudent && user.studentProfile) {
      await prisma.studentActivityLog
        .create({
          data: {
            studentId: user.studentProfile.id,
            userId: user.id,
            category: "AUTH",
            action: forceTakeover ? "SESSION_TAKEOVER" : "AUTH_LOGIN",
            description: forceTakeover
              ? `Terminated previous session on ${user.activeDeviceSummary || "another device"} and logged in on ${deviceSummary}`
              : `Logged in from ${deviceSummary}`,
            ipAddress,
            userAgent,
            deviceType: deviceSummary.includes("Mobile") ? "Mobile" : "Desktop",
            deviceModel: deviceSummary,
            metadata: {
              previousDevice: forceTakeover ? user.activeDeviceSummary : null,
              ip: ipAddress,
            },
          },
        })
        .catch((e) => console.error("Telemetry error:", e));
    }

    const roleNames = user.userRoles.map((ur) => ur.role.name);
    const allowedSchoolIds = Array.from(
      new Set(user.userRoles.map((ur) => ur.schoolId).filter((id): id is string => Boolean(id)))
    );

    const sessionPayload: SessionPayload = {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      roles: roleNames,
      facultyId: user.facultyProfile?.id || null,
      studentId: user.studentProfile?.id || null,
      allowedSchoolIds: allowedSchoolIds.length > 0 ? allowedSchoolIds : undefined,
      sessionId: isStudent ? newSessionId : undefined,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600, // 12 hours
    };

    await setSessionCookie(sessionPayload);

    await recordAuditLog({
      userId: user.id,
      action: "SUCCESSFUL_LOGIN",
      description: `User "${user.username}" (${user.fullName}) authenticated successfully`,
      resource: "User",
      resourceId: user.id,
      status: "SUCCESS",
      ipAddress,
      userAgent,
      details: { roles: roleNames, device: deviceSummary },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        roles: roleNames,
      },
    });
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 });
  }
}
