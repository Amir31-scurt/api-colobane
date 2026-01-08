"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshTokenUseCase = createRefreshTokenUseCase;
const crypto_1 = __importDefault(require("crypto"));
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createRefreshTokenUseCase(userId) {
    const token = crypto_1.default.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prismaClient_1.prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
        },
    });
    return token;
}
