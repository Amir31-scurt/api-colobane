// src/core/usecases/orders/updateOrderStatus.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatusUsecase(orderId: number, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  return prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
}
