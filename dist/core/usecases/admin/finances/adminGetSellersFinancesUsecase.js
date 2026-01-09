"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetSellersFinancesUsecase = adminGetSellersFinancesUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminGetSellersFinancesUsecase() {
    const sellers = await prismaClient_1.prisma.user.findMany({
        where: { role: "SELLER" },
        include: {
            brands: true
        }
    });
    const results = await Promise.all(sellers.map(async (seller) => {
        // Re-use logic or implement here for efficiency
        const orderItems = await prismaClient_1.prisma.orderItem.findMany({
            where: {
                product: { brand: { ownerId: seller.id } },
                order: {
                    status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED", "DELIVERED"] }
                }
            }
        });
        const grossRevenue = orderItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const feeRecords = await prismaClient_1.prisma.feeRecord.findMany({
            where: { sellerId: seller.id }
        });
        const totalCommissions = feeRecords.reduce((acc, fee) => acc + fee.appliedAmount, 0);
        const payouts = await prismaClient_1.prisma.payout.findMany({
            where: { sellerId: seller.id, status: "PAID" }
        });
        const totalPayouts = payouts.reduce((acc, p) => acc + p.amount, 0);
        const netRevenue = grossRevenue - totalCommissions;
        const balance = netRevenue - totalPayouts;
        return {
            id: seller.id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            grossRevenue,
            totalCommissions,
            totalPayouts,
            balance
        };
    }));
    return results;
}
