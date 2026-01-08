"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUsecase = loginUsecase;
// src/core/usecases/auth/loginUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenService_1 = require("../../services/tokenService");
async function loginUsecase(email, password) {
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user || !user.email) {
        throw new Error("INVALID_CREDENTIALS");
    }
    if (!user.password) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const match = await bcrypt_1.default.compare(password, user.password);
    if (!match) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const payload = {
        id: user.id,
        email: user.email, // email checked above
        role: user.role,
        phone: user.phone
    };
    const accessToken = (0, tokenService_1.createAccessToken)(payload);
    const refreshToken = (0, tokenService_1.createRefreshToken)(payload);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prismaClient_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt
        }
    });
    return { user, accessToken, refreshToken };
}
