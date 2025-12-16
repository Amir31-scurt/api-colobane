import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function listUserOrdersUsecase(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });
}
