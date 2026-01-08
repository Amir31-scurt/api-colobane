"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailUseCase = verifyEmailUseCase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function verifyEmailUseCase(token) {
    const record = await prismaClient_1.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
    });
    if (!record) {
        throw new Error("INVALID_TOKEN");
    }
    if (record.used || record.expiresAt < new Date()) {
        throw new Error("TOKEN_EXPIRED");
    }
    await prismaClient_1.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { used: true },
    });
    await prismaClient_1.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
    });
    return true;
}
