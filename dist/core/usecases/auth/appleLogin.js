"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleLogin = appleLogin;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const tokenService_1 = require("../../services/tokenService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function appleLogin(input) {
    // 1. Decode token
    // TODO: Verify token signature using Apple's public keys (JWKS)
    const decoded = jsonwebtoken_1.default.decode(input.token);
    if (!decoded || !decoded.sub || !decoded.email) {
        throw new Error("INVALID_APPLE_TOKEN");
    }
    const { sub: appleId, email } = decoded;
    // 2. Find user by appleId
    let user = await prismaClient_1.prisma.user.findUnique({
        where: { appleId }
    });
    // 3. If not found, find by email
    if (!user) {
        user = await prismaClient_1.prisma.user.findUnique({
            where: { email }
        });
        if (user) {
            // Link account
            user = await prismaClient_1.prisma.user.update({
                where: { id: user.id },
                data: { appleId }
            });
        }
        else {
            // User doesn't exist, create new
            if (!input.phone) {
                throw new Error("PHONE_REQUIRED");
            }
            // Check if phone unique
            const phoneExists = await prismaClient_1.prisma.user.findUnique({
                where: { phone: input.phone }
            });
            if (phoneExists) {
                throw new Error("PHONE_ALREADY_USED");
            }
            user = await prismaClient_1.prisma.user.create({
                data: {
                    email,
                    name: input.name || "Apple User",
                    appleId,
                    emailVerified: true,
                    role: "CUSTOMER",
                    isActive: true,
                    phone: input.phone
                }
            });
        }
    }
    // 4. Generate Token (Session token for our app)
    // 4. Generate Token (Session token for our app)
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
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl
        },
        token
    };
}
