// src/core/usecases/auth/refreshTokenUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken
} from "../../services/tokenService.ts";

export async function refreshTokenUsecase(refreshToken: string) {
  // Vérifier s'il existe en base et non révoqué/expiré
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const payload = verifyRefreshToken(refreshToken);

  const newPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };

  const newAccessToken = createAccessToken(newPayload);
  const newRefreshToken = createRefreshToken(newPayload);

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 30);

  // Révoquer l'ancien token + ajouter le nouveau
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() }
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: newExpiresAt
      }
    })
  ]);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
