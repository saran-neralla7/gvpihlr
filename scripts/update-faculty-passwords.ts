import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "gvpihlr@2026";
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Find all faculty users
  const facultyUsers = await prisma.user.findMany({
    where: {
      facultyProfile: {
        isNot: null,
      },
    },
    include: {
      facultyProfile: true,
    },
  });

  console.log(`Found ${facultyUsers.length} faculty users to update...`);

  for (const user of facultyUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });
    console.log(`Updated faculty: ${user.fullName} (${user.username}) -> ${newPassword}`);
  }

  console.log(`✅ Successfully updated ${facultyUsers.length} faculty passwords to "${newPassword}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
