import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { PaymentStatus } from "@prisma/client";

export async function adminGetStatsUsecase() {
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 7);

  const [orders7d, users7d, paidPayments7d, failedPayments7d, paidAmountAgg] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.payment.count({ where: { createdAt: { gte: since }, status: "PAID" } }),
      prisma.payment.count({
        where: { createdAt: { gte: since }, status: { in: ["FAILED", "CANCELED"] } },
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: since }, status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

  return {
    rangeDays: 7,
    orders7d,
    users7d,
    paidPayments7d,
    failedPayments7d,
    revenuePaid7d: paidAmountAgg._sum.amount || 0,
    currency: "XOF",
  };
}