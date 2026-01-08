"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmailToUserUseCase = addEmailToUserUseCase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const sendVerificationEmailUsecase_1 = require("../notifications/sendVerificationEmailUsecase");
async function addEmailToUserUseCase(userId, email) {
    const existing = await prismaClient_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("EMAIL_ALREADY_USED");
    }
    await prismaClient_1.prisma.user.update({
        where: { id: userId },
        data: {
            email,
            emailVerified: false,
        },
    });
    await (0, sendVerificationEmailUsecase_1.sendVerificationEmailUseCase)(userId, email);
}
