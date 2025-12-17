import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getOrderUsecase(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) throw new Error("ORDER_NOT_FOUND");
  return order;
}
