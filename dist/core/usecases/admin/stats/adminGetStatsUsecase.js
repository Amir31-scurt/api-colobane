"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetStatsUsecase = adminGetStatsUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminGetStatsUsecase() {
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 7);
    const [orders7d, users7d, paidPayments7d, failedPayments7d, paidAmountAgg] = await Promise.all([
        prismaClient_1.prisma.order.count({ where: { createdAt: { gte: since } } }),
        prismaClient_1.prisma.user.count({ where: { createdAt: { gte: since } } }),
        prismaClient_1.prisma.payment.count({ where: { createdAt: { gte: since }, status: "PAID" } }),
        prismaClient_1.prisma.payment.count({
            where: { createdAt: { gte: since }, status: { in: ["FAILED", "CANCELED"] } },
        }),
        prismaClient_1.prisma.payment.aggregate({
            where: { createdAt: { gte: since }, status: "PAID" },
            _sum: { amount: true },
        }),
    ]);
    return {
        rangeDays: 7,
        orders7d,
        users7d,
        paidPayments7d,
        failedPayments7d,
        revenuePaid7d: paidAmountAgg._sum.amount || 0,
        currency: "XOF",
    };
}
