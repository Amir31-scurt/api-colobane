"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordUsecase = resetPasswordUsecase;
// src/core/usecases/auth/resetPasswordUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function resetPasswordUsecase(token, newPassword) {
    const user = await prismaClient_1.prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpiresAt: {
                gt: new Date()
            }
        }
    });
    if (!user) {
        throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }
    const hashed = await bcrypt_1.default.hash(newPassword, 10);
    await prismaClient_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashed,
            resetPasswordToken: null,
            resetPasswordExpiresAt: null
        }
    });
}
