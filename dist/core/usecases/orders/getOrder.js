"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderUsecase = getOrderUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getOrderUsecase(orderId) {
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: { product: true }
            }
        }
    });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    return order;
}
