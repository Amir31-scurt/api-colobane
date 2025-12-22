import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { PaymentStatus } from "@prisma/client";

export async function adminGetStatsUsecase() {
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 7);

const [orders7d, paid7d, failed7d, users7d] = await Promise.all([
  prisma.order.count({
    where: {
      createdAt: { gte: since },
    },
  }),

  prisma.order.count({
    where: {
      createdAt: { gte: since },
      Payment: {
        some: {
          status: PaymentStatus.PAID,
        },
      },
    },
  }),

  prisma.order.count({
    where: {
      createdAt: { gte: since },
      Payment: {
        some: {
          status: PaymentStatus.FAILED,
        },
      },
    },
  }),

  prisma.user.count({
    where: {
      createdAt: { gte: since },
    },
  }),
]);

  return {
    rangeDays: 7,
    orders7d,
    paid7d,
    failed7d,
    users7d,
  };
}
