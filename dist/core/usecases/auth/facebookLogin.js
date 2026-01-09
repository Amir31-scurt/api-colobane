"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facebookLogin = facebookLogin;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
async function facebookLogin(input) {
    // 1. Verify token with Facebook
    let fbUser;
    try {
        const response = await axios_1.default.get(`https://graph.facebook.com/me?access_token=${input.token}&fields=id,name,email,picture.type(large)`);
        fbUser = response.data;
    }
    catch (error) {
        throw new Error("INVALID_FACEBOOK_TOKEN");
    }
    const { id: facebookId, email, name, picture } = fbUser;
    const avatarUrl = picture?.data?.url;
    // Note: Facebook might not return email if user didn't grant permission or signed up with phone only.
    // We can key off facebookId primarily.
    let user = await prismaClient_1.prisma.user.findUnique({
        where: { facebookId }
    });
    if (!user && email) {
        // Check if email exists
        user = await prismaClient_1.prisma.user.findUnique({
            where: { email }
        });
        if (user) {
            // Link account
            user = await prismaClient_1.prisma.user.update({
                where: { id: user.id },
                data: { facebookId }
            });
        }
    }
    if (!user) {
        // Create new user
        if (!input.phone) {
            throw new Error("PHONE_REQUIRED_FOR_NEW_USER");
        }
        if (!email) {
            // We really prefer email. If FB doesn't give email, and user didn't provide one...
            // For now let's assume if email is missing we might fail or allow strictly phone-based user if model supports it (model says email String?, so yes).
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
                email: email || undefined,
                name: name || "Facebook User",
                facebookId,
                avatarUrl: avatarUrl,
                role: "CUSTOMER",
                isActive: true,
                phone: input.phone
            }
        });
    }
    // 4. Update avatar if missing
    if (!user.avatarUrl && avatarUrl) {
        await prismaClient_1.prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl }
        });
    }
    // 5. Generate Token
    const token = jsonwebtoken_1.default.sign({
        sub: String(user.id),
        id: user.id,
        email: user.email, // might be null if FB didn't give email
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
