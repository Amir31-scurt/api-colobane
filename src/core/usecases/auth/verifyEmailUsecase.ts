import { prisma } from "../../../infrastructure/prisma/prismaClient";


export async function verifyEmailUseCase(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    throw new Error("INVALID_TOKEN");
  }

  if (record.used || record.expiresAt < new Date()) {
    throw new Error("TOKEN_EXPIRED");
  }

  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  return true;
}
