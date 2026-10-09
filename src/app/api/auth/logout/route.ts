import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST() {
  const session = await getCurrentSession();

  if (session) {
    await recordAuditLog({
      userId: session.userId,
      action: "LOGOUT",
      resource: "User",
      resourceId: session.userId,
      status: "SUCCESS",
    });
  }

  await clearSessionCookie();

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
