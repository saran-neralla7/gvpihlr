import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json({ success: false, error: "sectionId is required" }, { status: 400 });
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        sectionId,
        isCurrent: true,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        section: {
          select: {
            name: true,
            year: true,
            semester: true,
          },
        },
      },
      orderBy: {
        student: {
          rollNumber: "asc",
        },
      },
    });

    const students = enrollments.map((e) => ({
      id: e.student.id,
      rollNumber: e.student.rollNumber,
      fullName: e.student.user.fullName,
      email: e.student.user.email,
      phone: e.student.user.phone,
      gender: e.student.gender,
      sectionName: e.section.name,
      year: e.year,
      semester: e.semester,
    }));

    return NextResponse.json({ success: true, students });
  } catch (err: any) {
    console.error("LMS Students GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load students" }, { status: 500 });
  }
}
