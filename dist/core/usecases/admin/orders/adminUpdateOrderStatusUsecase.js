"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateOrderStatusUsecase = adminUpdateOrderStatusUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminUpdateOrderStatusUsecase(params) {
    const { actorId, orderId, status, note } = params;
    const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    const updated = await prismaClient_1.prisma.$transaction(async (tx) => {
        const u = await tx.order.update({
            where: { id: orderId },
            data: { status: status },
        });
        await tx.orderStatusHistory.create({
            data: {
                orderId,
                status: status,
                note: note || "Admin update",
                changedBy: actorId,
            },
        });
        await tx.auditLog.create({
            data: {
                action: "ORDER_STATUS_UPDATED",
                actorId,
                entityType: "Order",
                entityId: String(orderId),
                meta: { from: order.status, to: status, note: note || null },
            },
        });
        return u;
    });
    return updated;
}
