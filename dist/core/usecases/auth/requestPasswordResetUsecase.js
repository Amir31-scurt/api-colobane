"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordResetUsecase = requestPasswordResetUsecase;
// src/core/usecases/auth/requestPasswordResetUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const crypto_1 = __importDefault(require("crypto"));
async function requestPasswordResetUsecase(email) {
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        // on ne leak pas que l'email n'existe pas
        return;
    }
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // valable 1h
    await prismaClient_1.prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: token,
            resetPasswordExpiresAt: expiresAt
        }
    });
    // ICI: appeler un service d'envoi d'email plus tard
}
