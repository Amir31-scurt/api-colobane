"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrdersUsecase = listOrdersUsecase;
// src/core/usecases/orders/listOrders
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listOrdersUsecase(userId) {
    return prismaClient_1.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" }
    });
}
