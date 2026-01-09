"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyReportUsecase = generateMonthlyReportUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
const date_fns_1 = require("date-fns");
async function generateMonthlyReportUsecase(monthDate) {
    const targetDate = monthDate || (0, date_fns_1.subMonths)(new Date(), 1); // Default to last month
    const start = (0, date_fns_1.startOfMonth)(targetDate);
    const end = (0, date_fns_1.endOfMonth)(targetDate);
    // 1. Orders summary
    const orders = await prismaClient_1.prisma.order.findMany({
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
    const commissions = await prismaClient_1.prisma.feeRecord.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end
            }
        }
    });
    const totalCommissions = commissions.reduce((acc, c) => acc + c.appliedAmount, 0);
    // 3. New Sellers
    const newSellers = await prismaClient_1.prisma.user.count({
        where: {
            role: "SELLER",
            createdAt: {
                gte: start,
                lte: end
            }
        }
    });
    // 4. New Customers
    const newCustomers = await prismaClient_1.prisma.user.count({
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
