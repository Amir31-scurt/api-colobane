"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerGetStatsUsecase = sellerGetStatsUsecase;
const client_1 = require("@prisma/client");
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function sellerGetStatsUsecase(sellerId) {
    // 1. Get Seller's Brands
    const brands = await prismaClient_1.prisma.brand.findMany({
        where: { ownerId: sellerId },
        select: { id: true },
    });
    const brandIds = brands.map((b) => b.id);
    if (brandIds.length === 0) {
        return {
            totalRevenue: 0,
            totalOrders: 0,
            topProducts: [],
        };
    }
    // 2. Revenue Calculation using Raw Query
    // Note: Prisma.join helps with list parameters in raw queries
    const revenueResult = await prismaClient_1.prisma.$queryRaw `
    SELECT SUM(oi."unitPrice" * oi.quantity) as revenue
    FROM "OrderItem" oi
    JOIN "Product" p ON oi."productId" = p.id
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE p."brandId" IN (${client_1.Prisma.join(brandIds)})
    AND o.status != 'CANCELLED'
  `;
    const totalRevenue = Number(revenueResult[0]?.revenue || 0);
    // 3. Unique Orders Count
    const uniqueOrdersCount = await prismaClient_1.prisma.order.count({
        where: {
            status: { not: client_1.OrderStatus.CANCELLED },
            items: {
                some: {
                    product: {
                        brandId: { in: brandIds },
                    },
                },
            },
        },
    });
    // 4. Top Products
    const topProductsRaw = await prismaClient_1.prisma.orderItem.groupBy({
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
    const productDetails = await prismaClient_1.prisma.product.findMany({
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
        totalOrders: uniqueOrdersCount,
        topProducts,
    };
}
