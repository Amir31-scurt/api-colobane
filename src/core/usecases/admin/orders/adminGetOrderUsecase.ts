import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminGetOrderUsecase(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      deliveryAssignments: true,
      Payment: true,
    },
  });

  if (!order) throw new Error("ORDER_NOT_FOUND");
  return order;
}
