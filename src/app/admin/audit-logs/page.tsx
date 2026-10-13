import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseDevice } from "@/lib/audit";
import AuditLogsClient from "./AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await getCurrentSession();
  const isSuperAdmin =
    session?.roles.includes("SUPER_ADMIN") ||
    session?.roles.includes("ACADEMIC_ADMIN") ||
    session?.roles.includes("DEAN");

  if (!session || !isSuperAdmin) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { timestamp: "desc" },
    include: {
      user: {
        select: {
          fullName: true,
          username: true,
        },
      },
    },
  });

  const formattedLogs = logs.map((log) => {
    const detailsObj = (log.details as any) || {};
    const parsed = parseDevice(log.userAgent);

    const description =
      detailsObj.description ||
      (log.action === "LOGIN"
        ? `User signed in successfully`
        : log.action === "FAILED_LOGIN"
        ? `Authentication attempt rejected`
        : log.action === "ATTENDANCE_SUBMIT"
        ? `Submitted attendance session`
        : log.action === "SUBJECT_CREATE"
        ? `Created curriculum subject ${detailsObj.code || ""}`
        : `${log.action} performed on ${log.resource}`);

    const date = new Date(log.timestamp);
    const formattedTime = date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return {
      id: log.id,
      userId: log.userId,
      action: log.action,
      description,
      actorName: log.user?.fullName || "System / Anonymous",
      actorUsername: log.user?.username || "anonymous",
      resource: log.resource,
      resourceId: log.resourceId,
      status: log.status,
      ipAddress: log.ipAddress || "127.0.0.1",
      userAgent: log.userAgent || "Unknown Device",
      deviceType: parsed.deviceType,
      deviceSummary: detailsObj.device || parsed.summary,
      timestamp: log.timestamp.toISOString(),
      formattedTime,
      details: log.details,
    };
  });

  return <AuditLogsClient initialLogs={formattedLogs} />;
}
