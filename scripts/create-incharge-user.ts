import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating First Year Incharge Account...");

  // Password hash for Incharge@123
  const passwordHash = await bcrypt.hash("Incharge@123", 12);

  // 1. Find the 3 Schools
  const scse = await prisma.school.findUnique({ where: { code: "SCSE" } });
  const seee = await prisma.school.findUnique({ where: { code: "SEEE" } });
  const scmc = await prisma.school.findUnique({ where: { code: "SCMC" } });

  if (!scse || !seee || !scmc) {
    throw new Error("Could not find the 3 schools (SCSE, SEEE, SCMC)");
  }

  console.log(`Schools found: SCSE (${scse.id}), SEEE (${seee.id}), SCMC (${scmc.id})`);

  // 2. Find Roles
  const academicAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleType.ACADEMIC_ADMIN },
  });
  const deanRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleType.DEAN },
  });
  const facultyRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleType.FACULTY },
  });

  // 3. Find Home Department (e.g. Mathematics or CSE)
  const mathDept = await prisma.department.findFirst({
    where: { code: "MATH" },
  });

  const departmentId = mathDept?.id || (await prisma.department.findFirstOrThrow()).id;

  // 4. Upsert User: firstyearincharge
  const inchargeUser = await prisma.user.upsert({
    where: { username: "firstyearincharge" },
    update: {
      fullName: "First Year Incharge",
      email: "firstyearincharge@gvpihlr.edu.in",
      passwordHash: passwordHash,
      phone: "+91 9876543211",
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
    },
    create: {
      username: "firstyearincharge",
      fullName: "First Year Incharge",
      email: "firstyearincharge@gvpihlr.edu.in",
      passwordHash: passwordHash,
      phone: "+91 9876543211",
      isActive: true,
    },
  });

  console.log(`User created/updated: ${inchargeUser.username} (${inchargeUser.id})`);

  // Also create/update alias "incharge" for convenience
  await prisma.user.upsert({
    where: { username: "incharge" },
    update: {
      fullName: "First Year Incharge",
      email: "incharge@gvpihlr.edu.in",
      passwordHash: passwordHash,
      phone: "+91 9876543211",
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
    },
    create: {
      username: "incharge",
      fullName: "First Year Incharge",
      email: "incharge@gvpihlr.edu.in",
      passwordHash: passwordHash,
      phone: "+91 9876543211",
      isActive: true,
    },
  });

  // 5. Upsert Faculty Profile for firstyearincharge
  await prisma.faculty.upsert({
    where: { userId: inchargeUser.id },
    update: {
      employeeId: "GVPIHLR-FYI-001",
      shortName: "FYI",
      designation: "First Year Incharge / Professor",
      departmentId: departmentId,
      isActive: true,
    },
    create: {
      userId: inchargeUser.id,
      employeeId: "GVPIHLR-FYI-001",
      shortName: "FYI",
      designation: "First Year Incharge / Professor",
      departmentId: departmentId,
      isActive: true,
    },
  });

  // Also faculty profile for incharge alias
  const aliasUser = await prisma.user.findUniqueOrThrow({ where: { username: "incharge" } });
  await prisma.faculty.upsert({
    where: { userId: aliasUser.id },
    update: {
      employeeId: "GVPIHLR-FYI-002",
      shortName: "FYI-ALIAS",
      designation: "First Year Incharge / Professor",
      departmentId: departmentId,
      isActive: true,
    },
    create: {
      userId: aliasUser.id,
      employeeId: "GVPIHLR-FYI-002",
      shortName: "FYI-ALIAS",
      designation: "First Year Incharge / Professor",
      departmentId: departmentId,
      isActive: true,
    },
  });

  // 6. Assign Scoped UserRoles for both accounts
  const usersToSetup = [inchargeUser, aliasUser];

  for (const usr of usersToSetup) {
    // Clean old roles
    await prisma.userRole.deleteMany({
      where: { userId: usr.id },
    });

    // Add ACADEMIC_ADMIN and DEAN roles scoped to each of the 3 schools
    const schoolIds = [scse.id, seee.id, scmc.id];

    for (const schId of schoolIds) {
      await prisma.userRole.create({
        data: {
          userId: usr.id,
          roleId: academicAdminRole.id,
          schoolId: schId,
        },
      });

      await prisma.userRole.create({
        data: {
          userId: usr.id,
          roleId: deanRole.id,
          schoolId: schId,
        },
      });
    }

    // Add general FACULTY role
    await prisma.userRole.create({
      data: {
        userId: usr.id,
        roleId: facultyRole.id,
      },
    });
  }

  console.log("Successfully created First Year Incharge logins!");
  console.log("Username: firstyearincharge (or incharge)");
  console.log("Password: Incharge@123");
  console.log("Scoped Schools: SCSE, SEEE, SCMC");
}

main()
  .catch((e) => {
    console.error("Error creating user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
