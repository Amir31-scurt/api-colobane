// src/core/usecases/auth/requestPasswordResetUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import crypto from "crypto";

export async function requestPasswordResetUsecase(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // on ne leak pas que l'email n'existe pas
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // valable 1h

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpiresAt: expiresAt
    }
  });

  // ICI: appeler un service d'envoi d'email plus tard
  console.log(
    `Reset password token pour ${email} : ${token} (TODO: envoyer par email)`
  );
}
