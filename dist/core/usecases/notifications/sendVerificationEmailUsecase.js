"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmailUseCase = sendVerificationEmailUseCase;
const crypto_1 = __importDefault(require("crypto"));
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const resendProvider_1 = require("../../../infrastructure/email/resendProvider");
const verifyEmailTemplate_1 = require("../../../infrastructure/email/templates/verifyEmailTemplate");
async function sendVerificationEmailUseCase(userId, email) {
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await prismaClient_1.prisma.emailVerificationToken.create({
        data: {
            token,
            expiresAt,
            userId,
        },
    });
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await (0, resendProvider_1.sendEmail)({
        to: email,
        subject: "Vérifiez votre adresse email – Colobane",
        html: (0, verifyEmailTemplate_1.verifyEmailTemplate)(verificationLink),
    });
}
