// src/core/usecases/seller/getSellerDashboardUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export interface SellerDashboardStats {
  totalRevenue: number;
  netRevenue: number,
  totalFees: number,
  last30DaysRevenue: number;
  totalOrders: number;
  last30DaysOrders: number;
  discountGiven: number;
  last30DaysDiscountGiven: number;
  statusCounts: Record<string, number>;
  bestSellingProducts: {
    productId: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

export async function getSellerDashboardUsecase(ownerId: number): Promise<SellerDashboardStats> {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const products = await prisma.product.findMany({
    where: { brand: { ownerId } },
    select: { id: true, name: true, price: true }
  });

  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) {
    return {
      totalRevenue: 0,
      netRevenue: 0,
      totalFees: 0,
      last30DaysRevenue: 0,
      totalOrders: 0,
      last30DaysOrders: 0,
      discountGiven: 0,
      last30DaysDiscountGiven: 0,
      statusCounts: {},
      bestSellingProducts: []
    };
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      order: true,
      product: true
    }
  });

  let totalRevenue = 0;
  let last30DaysRevenue = 0;
  let discountGiven = 0;
  let last30DaysDiscountGiven = 0;
  const ordersMap = new Map<number, { createdAt: Date; status: string }>();

  // Extract unique order IDs from orderItems
  const sellerOrderIds = Array.from(new Set(orderItems.map(item => item.orderId)));

  const fees = await prisma.feeRecord.findMany({
    where: { orderId: { in: sellerOrderIds } }
  });
  
  const totalFees = fees.reduce((sum : any, f:any) => sum + f.appliedAmount, 0);
  const netRevenue = totalRevenue - totalFees;  

  const productStats = new Map<number, {
    productId: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>();

  for (const item of orderItems) {
    const basePrice = item.product.price;
    const actualPrice = item.unitPrice;
    const qty = item.quantity;

    const lineOriginal = basePrice * qty;
    const lineRevenue = actualPrice * qty;
    const lineDiscount = lineOriginal - lineRevenue;

    totalRevenue += lineRevenue;
    discountGiven += lineDiscount > 0 ? lineDiscount : 0;

    const createdAt = item.order.createdAt;
    ordersMap.set(item.orderId, {
      createdAt,
      status: item.order.status
    });

    if (createdAt >= thirtyDaysAgo) {
      last30DaysRevenue += lineRevenue;
      last30DaysDiscountGiven += lineDiscount > 0 ? lineDiscount : 0;
    }

    const existing =
      productStats.get(item.productId) ?? {
        productId: item.productId,
        name: item.product.name,
        totalQuantity: 0,
        totalRevenue: 0
      };

    existing.totalQuantity += qty;
    existing.totalRevenue += lineRevenue;
    productStats.set(item.productId, existing);
  }

  const statusCounts: Record<string, number> = {};
  let last30DaysOrders = 0;

  for (const { createdAt, status } of ordersMap.values()) {
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    if (createdAt >= thirtyDaysAgo) {
      last30DaysOrders += 1;
    }
  }

  const bestSellingProducts = Array.from(productStats.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  return {
    totalRevenue,
    netRevenue,
    totalFees,
    last30DaysRevenue,
    totalOrders: ordersMap.size,
    last30DaysOrders,
    discountGiven,
    last30DaysDiscountGiven,
    statusCounts,
    bestSellingProducts
  };
}
