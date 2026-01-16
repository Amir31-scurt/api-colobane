import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { startOfDay, subDays } from "date-fns";

export async function sellerGetStatsUsecase(sellerId: number) {
    // 1. Get Seller's Brands
    const brands = await prisma.brand.findMany({
        where: { ownerId: sellerId },
        select: { id: true },
    });
    const brandIds = brands.map((b) => b.id);

    if (brandIds.length === 0) {
        return {
            totalRevenue: 0,
            totalOrders: 0,
            trends: {
                revenue: 0,
                orders: 0
            },
            topProducts: [],
        };
    }

    // Date Ranges
    const now = new Date();
    const last30DaysStart = startOfDay(subDays(now, 30));
    const previous30DaysStart = startOfDay(subDays(now, 60));

    // 2. Total Revenue (Lifetime)
    const revenueResult: any[] = await prisma.$queryRaw`
    SELECT SUM(oi."unitPrice" * oi.quantity) as revenue
    FROM "OrderItem" oi
    JOIN "Product" p ON oi."productId" = p.id
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE p."brandId" IN (${Prisma.join(brandIds)})
    AND o.status != 'CANCELLED'
  `;
    const totalRevenue = Number(revenueResult[0]?.revenue || 0);

    // 2b. Revenue Trends (Last 30 vs Prev 30)
    // Current 30 Days
    const revenueCurrentResult: any[] = await prisma.$queryRaw`
        SELECT SUM(oi."unitPrice" * oi.quantity) as revenue
        FROM "OrderItem" oi
        JOIN "Product" p ON oi."productId" = p.id
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE p."brandId" IN (${Prisma.join(brandIds)})
        AND o.status != 'CANCELLED'
        AND o."createdAt" >= ${last30DaysStart}
    `;
    const revenueCurrent = Number(revenueCurrentResult[0]?.revenue || 0);

    // Previous 30 Days
    const revenuePrevResult: any[] = await prisma.$queryRaw`
        SELECT SUM(oi."unitPrice" * oi.quantity) as revenue
        FROM "OrderItem" oi
        JOIN "Product" p ON oi."productId" = p.id
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE p."brandId" IN (${Prisma.join(brandIds)})
        AND o.status != 'CANCELLED'
        AND o."createdAt" >= ${previous30DaysStart}
        AND o."createdAt" < ${last30DaysStart}
    `;
    const revenuePrev = Number(revenuePrevResult[0]?.revenue || 0);

    const revenueTrend = revenuePrev === 0 
        ? (revenueCurrent > 0 ? 100 : 0) 
        : ((revenueCurrent - revenuePrev) / revenuePrev) * 100;

    // 3. Unique Orders Count (Lifetime)
    const totalOrders = await prisma.order.count({
        where: {
            status: { not: OrderStatus.CANCELLED },
            items: { some: { product: { brandId: { in: brandIds } } } },
        },
    });

    // 3b. Order Trends
    const ordersCurrent = await prisma.order.count({
        where: {
            status: { not: OrderStatus.CANCELLED },
            items: { some: { product: { brandId: { in: brandIds } } } },
            createdAt: { gte: last30DaysStart }
        },
    });
    
    const ordersPrev = await prisma.order.count({
        where: {
            status: { not: OrderStatus.CANCELLED },
            items: { some: { product: { brandId: { in: brandIds } } } },
            createdAt: { gte: previous30DaysStart, lt: last30DaysStart }
        },
    });

    const ordersTrend = ordersPrev === 0 
        ? (ordersCurrent > 0 ? 100 : 0) 
        : ((ordersCurrent - ordersPrev) / ordersPrev) * 100;

    // AOV Trends
    const aovCurrent = ordersCurrent > 0 ? revenueCurrent / ordersCurrent : 0;
    const aovPrev = ordersPrev > 0 ? revenuePrev / ordersPrev : 0;
    const aovTrend = aovPrev === 0 
        ? (aovCurrent > 0 ? 100 : 0) 
        : ((aovCurrent - aovPrev) / aovPrev) * 100;

    // 4. Top Products
    const topProductsRaw = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        where: {
            product: {
                brandId: { in: brandIds },
            },
        },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
    });

    const productDetails = await prisma.product.findMany({
        where: { id: { in: topProductsRaw.map((p) => p.productId) } },
        select: { id: true, name: true, price: true },
    });

    const topProducts = topProductsRaw.map((item) => {
        const p = productDetails.find((pd) => pd.id === item.productId);
        return {
            id: item.productId,
            name: p?.name || "Unknown",
            count: item._sum.quantity || 0,
            price: p?.price || 0,
        };
    });

    return {
        totalRevenue,
        totalOrders,
        trends: {
            revenue: revenueTrend,
            orders: ordersTrend,
            aov: aovTrend
        },
        topProducts,
    };
}
