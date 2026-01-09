"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOverviewUsecase = getAdminOverviewUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getAdminOverviewUsecase() {
    const [orders, fees, payments, sellers, products] = await Promise.all([
        prismaClient_1.prisma.order.findMany(),
        prismaClient_1.prisma.feeRecord.findMany(),
        prismaClient_1.prisma.payment.findMany(),
        prismaClient_1.prisma.user.count({ where: { role: "SELLER" } }),
        prismaClient_1.prisma.product.count()
    ]);
    const totalGMV = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalFees = fees.reduce((s, f) => s + f.appliedAmount, 0);
    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});
    const paymentsByProvider = payments.reduce((acc, p) => {
        acc[p.provider] = (acc[p.provider] || 0) + 1;
        return acc;
    }, {});
    return {
        totalGMV,
        totalFees,
        netMarketplaceRevenue: totalFees,
        totalOrders: orders.length,
        sellers,
        products,
        statusCounts,
        paymentsByProvider
    };
}
