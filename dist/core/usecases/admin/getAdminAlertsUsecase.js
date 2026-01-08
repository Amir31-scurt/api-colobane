"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAlertsUsecase = getAdminAlertsUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getAdminAlertsUsecase() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const cashPending = await prismaClient_1.prisma.payment.findMany({
        where: {
            provider: "CASH",
            status: "WAITING_CONFIRMATION",
            createdAt: { lte: yesterday }
        },
        include: { order: true }
    });
    const lowStock = await prismaClient_1.prisma.product.findMany({
        where: { stock: { lte: 5 } }
    });
    return {
        cashPendingCount: cashPending.length,
        lowStockCount: lowStock.length,
        cashPending,
        lowStock
    };
}
