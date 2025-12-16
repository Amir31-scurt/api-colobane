// src/core/usecases/auth/resetPasswordUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import bcrypt from "bcrypt";

export async function resetPasswordUsecase(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpiresAt: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null
    }
  });
}
