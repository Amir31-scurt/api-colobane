// src/core/usecases/auth/requestPasswordResetUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { sendEmail } from "../../../infrastructure/email/resendProvider";
import { resetPasswordTemplate } from "../../../infrastructure/email/templates/resetPasswordTemplate";
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

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Réinitialisation de votre mot de passe – Colobane",
    html: resetPasswordTemplate(resetLink),
  });
}
