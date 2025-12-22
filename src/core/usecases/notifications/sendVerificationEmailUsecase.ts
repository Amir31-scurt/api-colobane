import crypto from "crypto";
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { sendEmail } from "../../../infrastructure/email/resendProvider";
import { verifyEmailTemplate } from "../../../infrastructure/email/templates/verifyEmailTemplate";

export async function sendVerificationEmailUseCase(
  userId: number,
  email: string
) {
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.emailVerificationToken.create({
    data: {
      token,
      expiresAt,
      userId,
    },
  });

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Vérifiez votre adresse email – Colobane",
    html: verifyEmailTemplate(verificationLink),
  });
}
