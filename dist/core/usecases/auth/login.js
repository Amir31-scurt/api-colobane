"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
// src/core/usecases/auth/loginUser
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
    const token = jsonwebtoken_1.default.sign({
        sub: String(user.id), // userId as string
        id: user.id, // Keep for backward compatibility
        email: user.email,
        role: user.role,
        type: "access" // Required by jwt.ts verifyAccessToken
    }, String(process.env.JWT_SECRET), { expiresIn: String(process.env.JWT_EXPIRES_IN || "7d") });
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
