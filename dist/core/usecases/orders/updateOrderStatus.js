"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusUsecase = updateOrderStatusUsecase;
// src/core/usecases/orders/updateOrderStatus
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function updateOrderStatusUsecase(orderId, status) {
    const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    return prismaClient_1.prisma.order.update({
        where: { id: orderId },
        data: { status }
    });
}
