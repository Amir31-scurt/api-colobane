import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function sellerGetFinancesUsecase(sellerId: number) {
    // 1. Get gross revenue from order items
    // We only count orders that are PAID or beyond
    const orderItems = await prisma.orderItem.findMany({
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

    const grossRevenue = orderItems.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0);

    // 2. Get commissions (FeeRecords)
    const feeRecords = await prisma.feeRecord.findMany({
        where: {
            sellerId: sellerId
        }
    });

    const totalCommissions = feeRecords.reduce((acc: number, fee: any) => acc + fee.appliedAmount, 0);

    // 3. Get payouts
    const payouts = await prisma.payout.findMany({
        where: {
            sellerId: sellerId,
            status: "PAID"
        }
    });

    const totalPayouts = payouts.reduce((acc: number, p: any) => acc + p.amount, 0);

    const netRevenue = grossRevenue - totalCommissions;
    const balance = netRevenue - totalPayouts;

    // 4. Payout history
    const payoutHistory = await prisma.payout.findMany({
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
