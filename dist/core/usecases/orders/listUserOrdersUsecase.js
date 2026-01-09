"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserOrdersUsecase = listUserOrdersUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listUserOrdersUsecase(userId) {
    return prismaClient_1.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true
                }
            },
            deliveryMethod: true,
            deliveryLocation: true,
            Payment: true,
        }
    });
}
