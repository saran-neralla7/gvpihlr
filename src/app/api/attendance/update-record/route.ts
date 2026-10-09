import { NextResponse } from "next/server";
import { updateAttendanceRecord } from "@/lib/attendanceActions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await updateAttendanceRecord(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("API /api/attendance/update-record error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update attendance record" },
      { status: 500 }
    );
  }
}
