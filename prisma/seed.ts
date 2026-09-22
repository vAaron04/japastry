import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateRandomPassword(): string {
  return crypto.randomBytes(12).toString("base64url");
}

async function main() {
  const email = process.env.OWNER_EMAIL || "owner@japastry.local";
  const password = process.env.OWNER_PASSWORD || generateRandomPassword();
  const name = process.env.OWNER_NAME || "Owner";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Owner account already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash, role: "OWNER" },
  });

  console.log("Created owner account:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("Sign in and change this password by creating a new account, then remove this one.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
