import crypto from "crypto";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function createRefreshTokenUseCase(userId: number) {
  const token = crypto.randomBytes(40).toString("hex");

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}
