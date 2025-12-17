import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getAdminAlertsUsecase() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const cashPending = await prisma.payment.findMany({
    where: {
      provider: "CASH",
      status: "WAITING_CONFIRMATION",
      createdAt: { lte: yesterday }
    },
    include: { order: true }
  });

  const lowStock = await prisma.product.findMany({
    where: { stock: { lte: 5 } }
  });

  return {
    cashPendingCount: cashPending.length,
    lowStockCount: lowStock.length,
    cashPending,
    lowStock
  };
}
