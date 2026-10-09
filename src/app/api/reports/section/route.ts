import { NextResponse } from "next/server";
import { getSectionStudentAttendanceReport } from "@/lib/reportsActions";
import { getCurrentSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // STRICT ISOLATION: Students cannot view class registers of other students
    const isStudentUser =
      session.roles.includes("STUDENT") &&
      !session.roles.includes("SUPER_ADMIN") &&
      !session.roles.includes("FACULTY");

    if (isStudentUser) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Students are restricted to personal records only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId") || "";
    const subjectId = searchParams.get("subjectId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Faculty resource authorization check:
    if (!isSuperAdmin(session) && session.facultyId) {
      const isAssigned = await prisma.facultySubjectAssignment.findFirst({
        where: {
          sectionId,
          facultyId: session.facultyId,
          isActive: true,
        },
      });
      if (!isAssigned) {
        return NextResponse.json(
          { success: false, error: "Access Denied: You are not assigned to this section." },
          { status: 403 }
        );
      }
    }

    const report = await getSectionStudentAttendanceReport({
      sectionId,
      subjectId,
      startDate,
      endDate,
    });

    if (!report.success) {
      return NextResponse.json(report, { status: 400 });
    }

    return NextResponse.json(report, { status: 200 });
  } catch (err: any) {
    console.error("API /api/reports/section error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
