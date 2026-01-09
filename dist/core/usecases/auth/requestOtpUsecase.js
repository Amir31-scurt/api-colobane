"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtpUseCase = requestOtpUseCase;
const otp_1 = require("../../../infrastructure/auth/otp");
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function requestOtpUseCase(phone) {
    let user = await prismaClient_1.prisma.user.findUnique({ where: { phone } });
    if (!user) {
        user = await prismaClient_1.prisma.user.create({
            data: {
                phone,
                name: `User ${phone}`, // placeholder name
                email: `${phone}@temp.colobane`, // temporary email (or use phone as email)
                password: "" // empty password, user will set it later
            }
        });
    }
    const otp = await (0, otp_1.createOtp)(user.id);
    // DEV ONLY (plus tard SMS)
    return true;
}
