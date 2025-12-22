import { signAccessToken, signRefreshToken } from "../../../config/jwt";
import { prisma } from "../../../infrastructure/prisma/prismaClient";


export async function verifyOtpUseCase(phone: string, code: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const otp = await prisma.oTPCode.findFirst({
    where: {
      userId: user.id,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) throw new Error("OTP_INVALID");

  await prisma.oTPCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true },
  });

  return {
    accessToken: signAccessToken({ userId: user.id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user.id }),
  };
}
