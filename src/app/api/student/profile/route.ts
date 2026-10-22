import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordAuditLog, extractClientInfo } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || !session.studentId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            username: true,
          },
        },
        enrollments: {
          where: { isCurrent: true },
          include: {
            program: { include: { school: true } },
            section: true,
            academicYear: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getCurrentSession();
  if (!session || !session.studentId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { ipAddress, userAgent } = extractClientInfo(req);

  try {
    const currentStudent = await prisma.student.findUnique({
      where: { id: session.studentId },
    });

    if (!currentStudent) {
      return NextResponse.json({ success: false, error: "Student record not found" }, { status: 404 });
    }

    // Permission Enforcement
    if (!currentStudent.isProfileEditAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile editing is currently locked by the college administration. Please contact the academic office.",
        },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Prepare student update data
    const studentUpdate: any = {};
    if (data.gender !== undefined) studentUpdate.gender = data.gender;
    if (data.bloodGroup !== undefined) studentUpdate.bloodGroup = data.bloodGroup;
    if (data.dateOfBirth) studentUpdate.dateOfBirth = new Date(data.dateOfBirth);
    if (data.registerNumber !== undefined) studentUpdate.registerNumber = data.registerNumber?.trim() || null;
    if (data.casteCategory !== undefined) studentUpdate.casteCategory = data.casteCategory;
    if (data.ews !== undefined) studentUpdate.ews = data.ews;
    if (data.specialCategory !== undefined) studentUpdate.specialCategory = data.specialCategory;
    if (data.state !== undefined) studentUpdate.state = data.state;
    if (data.region !== undefined) studentUpdate.region = data.region;
    if (data.nationality !== undefined) studentUpdate.nationality = data.nationality;
    if (data.religion !== undefined) studentUpdate.religion = data.religion;

    // Facilities
    if (data.transportFacility !== undefined) studentUpdate.transportFacility = Boolean(data.transportFacility);
    if (data.hostelFacility !== undefined) studentUpdate.hostelFacility = Boolean(data.hostelFacility);

    // Parent details
    if (data.fatherName !== undefined) studentUpdate.fatherName = data.fatherName;
    if (data.fatherOccupation !== undefined) studentUpdate.fatherOccupation = data.fatherOccupation;
    if (data.fatherAadhaar !== undefined) studentUpdate.fatherAadhaar = data.fatherAadhaar;
    if (data.motherName !== undefined) studentUpdate.motherName = data.motherName;
    if (data.motherOccupation !== undefined) studentUpdate.motherOccupation = data.motherOccupation;
    if (data.motherAadhaar !== undefined) studentUpdate.motherAadhaar = data.motherAadhaar;
    if (data.parentPhone !== undefined) studentUpdate.parentPhone = data.parentPhone;
    if (data.parentEmail !== undefined) studentUpdate.parentEmail = data.parentEmail;
    if (data.fatherName || data.motherName) {
      studentUpdate.parentName = data.fatherName || data.motherName;
    }

    // Addresses
    if (data.permanentAddress !== undefined) studentUpdate.permanentAddress = data.permanentAddress;
    if (data.permanentPincode !== undefined) studentUpdate.permanentPincode = data.permanentPincode;
    if (data.correspondenceAddress !== undefined) studentUpdate.correspondenceAddress = data.correspondenceAddress;
    if (data.correspondencePincode !== undefined) studentUpdate.correspondencePincode = data.correspondencePincode;

    // 10th & 12th
    if (data.tenthBoard !== undefined) studentUpdate.tenthBoard = data.tenthBoard;
    if (data.tenthMedium !== undefined) studentUpdate.tenthMedium = data.tenthMedium;
    if (data.tenthPercentage !== undefined) studentUpdate.tenthPercentage = data.tenthPercentage;
    if (data.tenthPassYear !== undefined) studentUpdate.tenthPassYear = data.tenthPassYear;

    if (data.twelfthBoard !== undefined) studentUpdate.twelfthBoard = data.twelfthBoard;
    if (data.twelfthMedium !== undefined) studentUpdate.twelfthMedium = data.twelfthMedium;
    if (data.interPercentage !== undefined) studentUpdate.interPercentage = data.interPercentage;
    if (data.twelfthPassYear !== undefined) studentUpdate.twelfthPassYear = data.twelfthPassYear;

    // Entrance
    if (data.qualifyingExam !== undefined) studentUpdate.qualifyingExam = data.qualifyingExam;
    if (data.eapcetRank !== undefined) studentUpdate.eapcetRank = data.eapcetRank;
    if (data.eapcetHallTicket !== undefined) studentUpdate.eapcetHallTicket = data.eapcetHallTicket;
    if (data.jeeRank !== undefined) studentUpdate.jeeRank = data.jeeRank;
    if (data.jeeScore !== undefined) {
      studentUpdate.jeeScore = data.jeeScore;
      studentUpdate.jeePercentile = data.jeeScore;
    }
    if (data.jeeHallTicket !== undefined) studentUpdate.jeeHallTicket = data.jeeHallTicket;

    const updatedStudent = await prisma.student.update({
      where: { id: currentStudent.id },
      data: studentUpdate,
    });

    // Optionally update user contact info if provided
    const userUpdate: any = {};
    if (data.phone) userUpdate.phone = data.phone.trim();
    if (data.email) userUpdate.email = data.email.trim();
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: currentStudent.userId },
        data: userUpdate,
      });
    }

    await recordAuditLog({
      userId: session.userId,
      action: "UPDATE",
      resource: "Student",
      resourceId: currentStudent.id,
      details: { studentUpdate, userUpdate },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Your admission profile has been saved successfully.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("Student self-profile update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
