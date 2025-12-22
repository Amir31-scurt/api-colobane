import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { sendVerificationEmailUseCase } from "../notifications/sendVerificationEmailUsecase";


export async function addEmailToUserUseCase(
  userId: number,
  email: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_ALREADY_USED");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      emailVerified: false,
    },
  });

  await sendVerificationEmailUseCase(userId, email);
}
