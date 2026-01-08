"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
const prismaClient_1 = require("../infrastructure/prisma/prismaClient");
async function generateOTP(userId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await prismaClient_1.prisma.oTPCode.create({
        data: {
            code,
            expiresAt,
            userId,
        },
    });
    return code;
}
