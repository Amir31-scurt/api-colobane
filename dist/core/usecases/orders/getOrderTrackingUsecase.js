"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderTrackingUsecase = getOrderTrackingUsecase;
// src/core/usecases/orders/getOrderTrackingUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getOrderTrackingUsecase(orderId, userId, isSeller, isAdmin) {
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                    variant: true
                }
            },
            Payment: true,
            statusHistory: {
                orderBy: { createdAt: "asc" }
            }
        }
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    if (!isAdmin && !isSeller && order.userId !== userId) {
        throw new Error("FORBIDDEN");
    }
    return order;
}
