"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerGetFinancesUsecase = sellerGetFinancesUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function sellerGetFinancesUsecase(sellerId) {
    // 1. Get gross revenue from order items
    // We only count orders that are PAID or beyond
    const orderItems = await prismaClient_1.prisma.orderItem.findMany({
        where: {
            product: {
                brand: {
                    ownerId: sellerId
                }
            },
            order: {
                status: {
                    in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED", "DELIVERED"]
                }
            }
        },
        include: {
            order: true
        }
    });
    const grossRevenue = orderItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    // 2. Get commissions (FeeRecords)
    const feeRecords = await prismaClient_1.prisma.feeRecord.findMany({
        where: {
            sellerId: sellerId
        }
    });
    const totalCommissions = feeRecords.reduce((acc, fee) => acc + fee.appliedAmount, 0);
    // 3. Get payouts
    const payouts = await prismaClient_1.prisma.payout.findMany({
        where: {
            sellerId: sellerId,
            status: "PAID"
        }
    });
    const totalPayouts = payouts.reduce((acc, p) => acc + p.amount, 0);
    const netRevenue = grossRevenue - totalCommissions;
    const balance = netRevenue - totalPayouts;
    // 4. Payout history
    const payoutHistory = await prismaClient_1.prisma.payout.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" }
    });
    return {
        grossRevenue,
        totalCommissions,
        netRevenue,
        totalPayouts,
        balance,
        payoutHistory
    };
}
