import { NextResponse } from "next/server";
import { getAllSectionsAttendanceReport } from "@/lib/reportsActions";
import { getCurrentSession } from "@/lib/auth";

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
    const rawStart = searchParams.get("startDate");
    const startDate = rawStart && rawStart.trim() !== "" ? rawStart.trim() : undefined;
    const rawEnd = searchParams.get("endDate");
    const endDate = rawEnd && rawEnd.trim() !== "" ? rawEnd.trim() : undefined;

    const report = await getAllSectionsAttendanceReport({
      startDate,
      endDate,
    });

    if (!report.success) {
      return NextResponse.json(report, { status: 400 });
    }

    return NextResponse.json(report, { status: 200 });
  } catch (err: any) {
    console.error("API /api/reports/all-sections error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
