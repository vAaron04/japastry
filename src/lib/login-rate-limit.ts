import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function isRateLimited(email: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - WINDOW_MS);

  await prisma.loginAttempt.deleteMany({
    where: { email, createdAt: { lt: cutoff } },
  });

  const count = await prisma.loginAttempt.count({
    where: { email, createdAt: { gte: cutoff } },
  });

  return count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(email: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { email } });
}
