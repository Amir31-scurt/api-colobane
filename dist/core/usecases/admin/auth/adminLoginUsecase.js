"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginUsecase = adminLoginUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
const jwt_1 = require("../../../security/jwt");
const password_1 = require("../../../security/password");
async function adminLoginUsecase(email, password) {
    const user = await prismaClient_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("INVALID_CREDENTIALS");
    if (user.isBlocked)
        throw new Error("USER_BLOCKED");
    // Allow both ADMIN and SELLER roles to login to the admin panel
    if (user.role !== "ADMIN" && user.role !== "SELLER") {
        throw new Error("FORBIDDEN");
    }
    const ok = await (0, password_1.verifyPassword)(password, user.password);
    if (!ok)
        throw new Error("INVALID_CREDENTIALS");
    // Use the actual user role in the token
    const accessToken = (0, jwt_1.signAccessToken)({ sub: String(user.id), role: user.role }, "4h");
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: "ADMIN_LOGIN",
            actorId: user.id,
            entityType: "User",
            entityId: String(user.id),
            meta: { email: user.email },
        },
    });
    return {
        accessToken,
        token: accessToken, // Alias for frontend compatibility
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        admin: { id: user.id, email: user.email, role: user.role }, // Legacy field
    };
}
