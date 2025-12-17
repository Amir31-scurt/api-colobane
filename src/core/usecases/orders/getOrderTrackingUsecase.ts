// src/core/usecases/orders/getOrderTrackingUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getOrderTrackingUsecase(orderId: number, userId: number, isSeller: boolean, isAdmin: boolean) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true
        }
      },
      Payment: true,
      statusHistory: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (!isAdmin && !isSeller && order.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return order;
}
