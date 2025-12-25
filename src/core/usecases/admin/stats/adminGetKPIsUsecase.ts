import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { OrderStatus } from "@prisma/client";

export async function adminGetKPIsUsecase() {
    // 1. General counts
    const [totalOrders, totalRevenueData, totalUsers, totalProducts, totalSellers] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: OrderStatus.CANCELLED } },
        }),
        prisma.user.count({ where: { role: "CUSTOMER" } }), // Focus on customers for conversion
        prisma.product.count(),
        prisma.user.count({ where: { role: "SELLER" } }),
    ]);

    const totalRevenue = totalRevenueData._sum.totalAmount || 0;

    // 2. Metrics
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    // Conversion Rate: Orders / Customers (Simple approximation)
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) : 0; // This is "Orders per Customer" actually.
    // Real conversion is (Transactions / Sessions), but we don't have sessions.
    // "Conversion Rate" in basic ecommerce often implies "% of visitors who buy".
    // Without visitors, "Orders per Customer" is a decent proxy for Customer Lifetime Value frequency, but not conversion.
    // Let's stick to returning it as "Orders / Customer" metric.

    // 3. Top Products (by quantity sold)
    // Grouping by OrderItem is heavy if table is huge, but fine for now.
    const topProductsRaw = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
    });

    const productIds = topProductsRaw.map((p) => p.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true },
    });

    const topProducts = topProductsRaw.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
            id: item.productId,
            name: product?.name || "Unknown",
            count: item._sum.quantity || 0,
            price: product?.price || 0,
        };
    });

    // 4. Revenue per Brand (Seller)
    // We can't easily group OrderItem by Brand in Prisma directly without raw query or iterating.
    // Raw query is cleaner for "JOIN".
    // SQL: SELECT b.name, SUM(oi.unitPrice * oi.quantity) as revenue FROM OrderItem oi JOIN Product p ON oi.productId = p.id JOIN Brand b ON p.brandId = b.id GROUP BY b.name ORDER BY revenue DESC LIMIT 5
    // Doing it in JS for safety/ORM consistency today.
    // We will fetch aggregated sales by Product, then map to Brand.
    const salesByProduct = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true }, // we need sum(quantity * unitPrice), but standard groupBy doesnt do calculated fields.
        // We can use the fact that unitPrice is likely consistent or we approximate.
        // Actually, accurate revenue needs sum(unitPrice * quantity). Prisma aggregate doesn't support expression sums.
        // We strictly need raw query for accurate revenue per brand.
    });

    // Let's try raw query for Top Brands
    const topBrands: any[] = await prisma.$queryRaw`
    SELECT b.name, SUM(oi."unitPrice" * oi.quantity) as revenue
    FROM "OrderItem" oi
    JOIN "Product" p ON oi."productId" = p.id
    JOIN "Brand" b ON p."brandId" = b.id
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o.status != 'CANCELLED'
    GROUP BY b.name
    ORDER BY revenue DESC
    LIMIT 5;
  `;

    // Ensure BigInt handling if any
    const formattedTopBrands = topBrands.map((b: any) => ({
        name: b.name,
        revenue: Number(b.revenue || 0),
    }));

    return {
        totalRevenue,
        totalOrders,
        totalCustomers: totalUsers,
        totalProducts,
        totalSellers,
        averageOrderValue,
        conversionRate, // Actually OrdersPerCustomer
        topProducts,
        topBrands: formattedTopBrands,
    };
}
