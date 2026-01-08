"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenUsecase = refreshTokenUsecase;
// src/core/usecases/auth/refreshTokenUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const tokenService_1 = require("../../services/tokenService");
async function refreshTokenUsecase(refreshToken) {
    // Vérifier s'il existe en base et non révoqué/expiré
    const stored = await prismaClient_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
    });
    if (!stored || stored.revoked || stored.revokedAt || stored.expiresAt < new Date()) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
    const payload = (0, tokenService_1.verifyRefreshToken)(refreshToken);
    const newPayload = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        phone: payload.phone
    };
    const newAccessToken = (0, tokenService_1.createAccessToken)(newPayload);
    const newRefreshToken = (0, tokenService_1.createRefreshToken)(newPayload);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    // Révoquer l'ancien token + ajouter le nouveau
    await prismaClient_1.prisma.$transaction([
        prismaClient_1.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() }
        }),
        prismaClient_1.prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: stored.userId,
                expiresAt: newExpiresAt
            }
        })
    ]);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
