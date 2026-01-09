"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminToggleUserBlockUsecase = adminToggleUserBlockUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminToggleUserBlockUsecase(params) {
    const { actorId, userId, isBlocked } = params;
    const user = await prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error("USER_NOT_FOUND");
    const updated = await prismaClient_1.prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked
        },
    });
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
            actorId,
            entityType: "User",
            entityId: String(userId),
            meta: { from: user.isBlocked, to: isBlocked },
        },
    });
    return updated;
}
