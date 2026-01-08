"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogoutUsecase = adminLogoutUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminLogoutUsecase(actorId) {
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: "ADMIN_LOGOUT",
            actorId,
            entityType: "User",
            entityId: String(actorId),
            meta: {},
        },
    });
    return { ok: true };
}
