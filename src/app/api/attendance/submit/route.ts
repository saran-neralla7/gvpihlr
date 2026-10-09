import { NextResponse } from "next/server";
import { submitAttendanceSession } from "@/lib/attendanceActions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await submitAttendanceSession(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("API /api/attendance/submit error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit attendance session" },
      { status: 500 }
    );
  }
}
