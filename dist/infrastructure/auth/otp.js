"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOtp = createOtp;
const prismaClient_1 = require("../prisma/prismaClient");
async function createOtp(userId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prismaClient_1.prisma.oTPCode.create({
        data: {
            userId,
            code,
            expiresAt,
        },
    });
    return code;
}
