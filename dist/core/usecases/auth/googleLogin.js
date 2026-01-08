"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = googleLogin;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
async function googleLogin(input) {
    // 1. Verify token with Google
    let googleUser;
    try {
        const response = await axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${input.token}`);
        googleUser = response.data;
    }
    catch (error) {
        throw new Error("INVALID_GOOGLE_TOKEN");
    }
    const { sub: googleId, email, name, picture } = googleUser;
    if (!email) {
        throw new Error("GOOGLE_ACCOUNT_NO_EMAIL");
    }
    // 2. Find user by googleId
    let user = await prismaClient_1.prisma.user.findUnique({
        where: { googleId }
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
                data: { googleId }
            });
        }
        else {
            // User doesn't exist, create new
            if (!input.phone) {
                throw new Error("PHONE_REQUIRED_FOR_NEW_USER");
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
                    name: name || "Google User",
                    googleId,
                    avatarUrl: picture,
                    emailVerified: true,
                    role: "CUSTOMER",
                    isActive: true,
                    phone: input.phone
                }
            });
        }
    }
    // 4. Update avatar if missing
    if (!user.avatarUrl && picture) {
        await prismaClient_1.prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl: picture }
        });
    }
    // 5. Generate Token
    const token = jsonwebtoken_1.default.sign({
        sub: String(user.id),
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        type: "access"
    }, String(process.env.JWT_SECRET), { expiresIn: String(process.env.JWT_EXPIRES_IN || "7d") });
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
