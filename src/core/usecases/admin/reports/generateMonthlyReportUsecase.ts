import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function generateMonthlyReportUsecase(monthDate?: Date) {
    const targetDate = monthDate || subMonths(new Date(), 1); // Default to last month
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    // 1. Orders summary
    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end
            },
            status: { not: "CANCELLED" }
        }
    });

    const totalOrders = orders.length;
    const totalVolume = orders.reduce((acc, o) => acc + o.totalAmount, 0);

    // 2. Commissions summary
    const commissions = await prisma.feeRecord.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end
            }
        }
    });

    const totalCommissions = commissions.reduce((acc, c) => acc + c.appliedAmount, 0);

    // 3. New Sellers
    const newSellers = await prisma.user.count({
        where: {
            role: "SELLER",
            createdAt: {
                gte: start,
                lte: end
            }
        }
    });

    // 4. New Customers
    const newCustomers = await prisma.user.count({
        where: {
            role: "CUSTOMER",
            createdAt: {
                gte: start,
                lte: end
            }
        }
    });

    return {
        month: start.toLocaleString('default', { month: 'long', year: 'numeric' }),
        period: { start, end },
        stats: {
            totalOrders,
            totalVolume,
            totalCommissions,
            newSellers,
            newCustomers
        }
    };
}
