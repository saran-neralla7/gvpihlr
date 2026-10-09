import prisma from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";
import { RoleType } from "@prisma/client";

async function main() {
  console.log("🧹 Starting clean database purge (removing all mock students, faculty, schools, programs)...");

  // 1. Delete Attendance Records and Sessions
  await prisma.attendanceRecord.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  console.log("✓ Cleared all attendance records & sessions.");

  // 2. Delete Lab Batches and Students
  await prisma.labBatchStudent.deleteMany({});
  await prisma.labBatch.deleteMany({});
  await prisma.studentEnrollment.deleteMany({});
  await prisma.student.deleteMany({});
  console.log("✓ Cleared all students and lab batches.");

  // 3. Delete Assignments, Offerings, Subjects, Sections
  await prisma.timetableEntry.deleteMany({});
  await prisma.facultySubjectAssignment.deleteMany({});
  await prisma.subjectOffering.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.section.deleteMany({});
  console.log("✓ Cleared all subject assignments, subjects, and sections.");

  // 4. Delete Faculty
  await prisma.faculty.deleteMany({});
  console.log("✓ Cleared all faculty profiles.");

  // 5. Delete Programs, Departments, Schools
  await prisma.program.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.school.deleteMany({});
  console.log("✓ Cleared all programs, departments, and schools.");

  // 6. Delete all User accounts EXCEPT "admin"
  await prisma.userRole.deleteMany({
    where: {
      user: {
        username: { not: "admin" },
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      username: { not: "admin" },
    },
  });
  console.log("✓ Cleared all non-admin users.");

  // 7. Ensure Standard System Roles Exist
  const roles = [
    RoleType.SUPER_ADMIN,
    RoleType.FACULTY,
    RoleType.STUDENT,
    RoleType.HOD,
    RoleType.DEAN,
  ];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `System ${roleName} role` },
    });
  }

  // 8. Ensure Super Admin Exists
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleType.SUPER_ADMIN },
  });
  const adminPasswordHash = await hashPassword("Admin@1234");
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash: adminPasswordHash,
      fullName: "GVPIHLR Super Administrator",
      isActive: true,
    },
    create: {
      username: "admin",
      email: "admin@gvpihlr.edu.in",
      passwordHash: adminPasswordHash,
      fullName: "GVPIHLR Super Administrator",
      phone: "+91 9440000001",
      isActive: true,
    },
  });

  // Check if admin already has SUPER_ADMIN role
  const existingAdminRole = await prisma.userRole.findFirst({
    where: { userId: adminUser.id, roleId: adminRole.id },
  });
  if (!existingAdminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
        schoolId: null,
        departmentId: null,
        programId: null,
      },
    });
  }
  console.log("✓ Verified Super Admin account (admin / Admin@1234).");

  // 9. Ensure Academic Year 2026-27 Exists
  await prisma.academicYear.upsert({
    where: { code: "2026-27" },
    update: { isCurrent: true, isActive: true },
    create: {
      code: "2026-27",
      startDate: new Date("2026-06-01T00:00:00Z"),
      endDate: new Date("2027-05-31T23:59:59Z"),
      isCurrent: true,
      isActive: true,
    },
  });
  console.log("✓ Verified Academic Year 2026-27.");

  // 10. Seed Regulation R1
  const regR1 = await prisma.regulation.upsert({
    where: { code: "R1" },
    update: {
      name: "Regulation R1",
      description: "University Curriculum Regulation R1 (Estd. 2026)",
      academicYearStart: "2026-27",
      isActive: true,
    },
    create: {
      code: "R1",
      name: "Regulation R1",
      description: "University Curriculum Regulation R1 (Estd. 2026)",
      academicYearStart: "2026-27",
      isActive: true,
    },
  });
  console.log(`✓ Seeded Regulation ${regR1.code} (${regR1.name}).`);

  console.log("\n🎉 Database successfully reset to pristine institutional state ready for user data!");
}

main()
  .catch((e) => {
    console.error("Error during reset:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
