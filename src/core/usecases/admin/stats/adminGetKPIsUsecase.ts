import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { OrderStatus } from "@prisma/client";

async function getPeriodStats(startDate: Date, endDate: Date) {
    const [revenueData, ordersCount, newCustomersCount] = await Promise.all([
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { not: OrderStatus.CANCELLED },
                createdAt: { gte: startDate, lte: endDate }
            },
        }),
        prisma.order.count({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            }
        }),
        prisma.user.count({
            where: {
                role: "CUSTOMER",
                createdAt: { gte: startDate, lte: endDate }
            }
        })
    ]);

    const revenue = revenueData._sum.totalAmount || 0;
    const aov = ordersCount > 0 ? revenue / ordersCount : 0;

    return { revenue, ordersCount, newCustomersCount, aov };
}

function calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
}

export async function adminGetKPIsUsecase() {
    // Define periods (Last 30 days vs Previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const [currentStats, prevStats] = await Promise.all([
        getPeriodStats(thirtyDaysAgo, now),
        getPeriodStats(sixtyDaysAgo, thirtyDaysAgo)
    ]);

    // Calculate Totals (Lifecycle)
    const [totalOrders, totalRevenueData, totalUsers] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: OrderStatus.CANCELLED } },
        }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);
    const totalRevenue = totalRevenueData._sum.totalAmount || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;


    // 3. Top Products & Brands
    const topProductsRaw = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
    });

    const topProductsIds = topProductsRaw.map((p) => p.productId);
    const topProductsDetails = await prisma.product.findMany({
        where: { id: { in: topProductsIds } },
        include: { brand: true }
    });

    const topProducts = topProductsRaw.map((item) => {
        const product = topProductsDetails.find((p) => p.id === item.productId);
        return {
            id: item.productId,
            name: product?.name || "Produit Inconnu",
            thumbnail: product?.thumbnailUrl || product?.imageUrl,
            price: product?.price || 0,
            salesCount: item._sum.quantity || 0,
            brandName: product?.brand?.name || "Admin"
        };
    });

    const trends = {
        revenue: calculateTrend(currentStats.revenue, prevStats.revenue),
        orders: calculateTrend(currentStats.ordersCount, prevStats.ordersCount),
        customers: calculateTrend(currentStats.newCustomersCount, prevStats.newCustomersCount),
        aov: calculateTrend(currentStats.aov, prevStats.aov),
        products: 0, // Trends for total stock not tracked historically in this simple model
        sellers: 0   // Trends for total sellers not tracked historically in this simplified model
    };

    // Note: For products and sellers, real historical trends require a snapshot table. 
    // For now we will return 0 or calculate based on 'createdAt' for "New Products/Sellers" flow if preferred.
    // Let's use "New Objects" count as a proxy for trend momentum for now.

    // Better approximation for "Active Growth":
    const [newProductsCount, prevNewProductsCount] = await Promise.all([
        prisma.product.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.product.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
    ]);
    const [newSellersCount, prevNewSellersCount] = await Promise.all([
        prisma.user.count({ where: { role: "SELLER", createdAt: { gte: thirtyDaysAgo } } }),
        prisma.user.count({ where: { role: "SELLER", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
    ]);

    trends.products = calculateTrend(newProductsCount, prevNewProductsCount);
    trends.sellers = calculateTrend(newSellersCount, prevNewSellersCount);

    return {
        // Main KPIs with Trends
        revenue: { value: totalRevenue, trend: trends.revenue },
        orders: { value: totalOrders, trend: trends.orders },
        customers: { value: totalUsers, trend: trends.customers },
        averageOrderValue: { value: averageOrderValue, trend: trends.aov },
        products: { value: await prisma.product.count(), trend: trends.products },
        sellers: { value: await prisma.user.count({ where: { role: "SELLER" } }), trend: trends.sellers },

        // Legacy fields
        totalRevenue,
        totalOrders,
        totalCustomers: totalUsers,
        totalProducts: await prisma.product.count(),
        totalSellers: await prisma.user.count({ where: { role: "SELLER" } }),

        topProducts,
        topBrands: [] // Placeholder
    };
}
