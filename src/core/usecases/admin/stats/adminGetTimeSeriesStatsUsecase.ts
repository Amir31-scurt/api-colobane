import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { OrderStatus } from "@prisma/client";

export async function adminGetTimeSeriesStatsUsecase() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 1. Fetch Orders for Time Series
    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: thirtyDaysAgo,
            },
            status: { not: OrderStatus.CANCELLED }, // Exclude cancelled for revenue
        },
        select: {
            createdAt: true,
            totalAmount: true,
            status: true,
        },
    });

    // 2. Fetch Payments Status Distribution (Last 30 days)
    const [payments, orderStatuses] = await Promise.all([
        prisma.payment.groupBy({
            by: ["status"],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: { status: true },
        }),
        prisma.order.groupBy({
            by: ["status"],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: { status: true },
        }),
    ]);

    // 3. Process Data
    const ordersByDayMap = new Map<string, number>();
    const revenueByDayMap = new Map<string, number>();

    // Initialize maps with 0 for all days to ensure continuity
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        ordersByDayMap.set(key, 0);
        revenueByDayMap.set(key, 0);
    }

    orders.forEach((order) => {
        const key = order.createdAt.toISOString().split("T")[0];
        if (ordersByDayMap.has(key)) {
            ordersByDayMap.set(key, (ordersByDayMap.get(key) || 0) + 1);
            revenueByDayMap.set(key, (revenueByDayMap.get(key) || 0) + order.totalAmount);
        }
    });

    // Sort by date (oldest to newest)
    const sortedDates = Array.from(ordersByDayMap.keys()).sort();

    const ordersByDay = sortedDates.map(date => ({
        date,
        count: ordersByDayMap.get(date) || 0,
    }));

    const revenueByDay = sortedDates.map(date => ({
        date,
        amount: revenueByDayMap.get(date) || 0,
    }));

    const paymentStats = payments.map(p => ({
        status: p.status,
        count: p._count.status,
    }));

    const orderStats = orderStatuses.map(o => ({
        status: o.status,
        count: o._count.status,
    }));

    return {
        ordersByDay,
        revenueByDay,
        paymentStats,
        orderStats,
    };
}
