import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function adminGetSellersFinancesUsecase() {
    const sellers = await prisma.user.findMany({
        where: { role: "SELLER" },
        include: {
            brands: true
        }
    });

    const results = await Promise.all(sellers.map(async (seller) => {
        // Re-use logic or implement here for efficiency
        const orderItems = await prisma.orderItem.findMany({
            where: {
                product: { brand: { ownerId: seller.id } },
                order: {
                    status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED", "DELIVERED"] }
                }
            }
        });

        const grossRevenue = orderItems.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0);

        const feeRecords = await prisma.feeRecord.findMany({
            where: { sellerId: seller.id }
        });
        const totalCommissions = feeRecords.reduce((acc: number, fee: any) => acc + fee.appliedAmount, 0);

        const payouts = await prisma.payout.findMany({
            where: { sellerId: seller.id, status: "PAID" }
        });
        const totalPayouts = payouts.reduce((acc: number, p: any) => acc + p.amount, 0);

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
