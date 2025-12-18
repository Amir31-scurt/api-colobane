import { prisma } from "../prisma/prismaClient";

export async function createOtp(userId: number) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.oTPCode.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  });

  return code;
}
