// src/core/usecases/orders/listOrders
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listOrdersUsecase(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
}
