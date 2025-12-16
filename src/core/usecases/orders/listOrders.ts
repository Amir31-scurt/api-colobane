// src/core/usecases/orders/listOrders.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function listOrdersUsecase(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
}
