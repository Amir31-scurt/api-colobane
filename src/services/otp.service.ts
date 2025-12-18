import { prisma } from "../infrastructure/prisma/prismaClient";


export async function generateOTP(userId: number) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.oTPCode.create({
    data: {
      code,
      expiresAt,
      userId,
    },
  });

  return code;
}
