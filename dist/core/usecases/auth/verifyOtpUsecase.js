"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpUseCase = verifyOtpUseCase;
const jwt_1 = require("../../../config/jwt");
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function verifyOtpUseCase(phone, code) {
    const user = await prismaClient_1.prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new Error("USER_NOT_FOUND");
    const otp = await prismaClient_1.prisma.oTPCode.findFirst({
        where: {
            userId: user.id,
            code,
            used: false,
            expiresAt: { gt: new Date() },
        },
    });
    if (!otp)
        throw new Error("OTP_INVALID");
    await prismaClient_1.prisma.oTPCode.update({
        where: { id: otp.id },
        data: { used: true },
    });
    await prismaClient_1.prisma.user.update({
        where: { id: user.id },
        data: { isActive: true },
    });
    return {
        accessToken: (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role }),
        refreshToken: (0, jwt_1.signRefreshToken)({ userId: user.id }),
    };
}
