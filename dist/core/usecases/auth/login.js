"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
// src/core/usecases/auth/loginUser
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokenService_1 = require("../../services/tokenService");
async function loginUser(input) {
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }
    if (!user.password) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const match = await bcryptjs_1.default.compare(input.password, user.password);
    if (!match) {
        throw new Error("INVALID_CREDENTIALS");
    }
    // Create token with format compatible with requireAuth middleware
    // Must include: sub (userId), role, type: "access"
    // Create token using centralized service
    const token = (0, tokenService_1.createAccessToken)({
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone
    });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            createdAt: user.createdAt
        },
        token
    };
}
