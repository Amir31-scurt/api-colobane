"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateUserRoleUsecase = adminUpdateUserRoleUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminUpdateUserRoleUsecase(params) {
    const { actorId, userId, role } = params;
    const user = await prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error("USER_NOT_FOUND");
    const updated = await prismaClient_1.prisma.user.update({
        where: { id: userId },
        data: { role },
    });
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: "USER_ROLE_UPDATED",
            actorId,
            entityType: "User",
            entityId: String(userId),
            meta: { from: user.role, to: role },
        },
    });
    return updated;
}
