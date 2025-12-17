import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getAdminOverviewUsecase() {
  const [
    orders,
    fees,
    payments,
    sellers,
    products
  ] = await Promise.all([
    prisma.order.findMany(),
    prisma.feeRecord.findMany(),
    prisma.payment.findMany(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.product.count()
  ]);

  const totalGMV = orders.reduce((s: any, o: any) => s + o.totalAmount, 0);
  const totalFees = fees.reduce((s: any, f: any) => s + f.appliedAmount, 0);

  const statusCounts = orders.reduce<Record<string, number>>((acc: any, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const paymentsByProvider = payments.reduce<Record<string, number>>((acc: any, p: any) => {
    acc[p.provider] = (acc[p.provider] || 0) + 1;
    return acc;
  }, {});

  return {
    totalGMV,
    totalFees,
    netMarketplaceRevenue: totalFees,
    totalOrders: orders.length,
    sellers,
    products,
    statusCounts,
    paymentsByProvider
  };
}
