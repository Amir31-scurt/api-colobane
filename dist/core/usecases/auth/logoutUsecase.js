"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUseCase = logoutUseCase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function logoutUseCase(refreshToken) {
    const stored = await prismaClient_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
    });
    if (!stored) {
        // On ne révèle pas l’existence du token (sécurité)
        return;
    }
    if (stored.revoked) {
        return;
    }
    await prismaClient_1.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
            revoked: true,
            revokedAt: new Date(),
        },
    });
}
