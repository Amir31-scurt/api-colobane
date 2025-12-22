import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminGetOrderUsecase(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true, price: true, brandId: true } },
          variant: { select: { id: true, name: true, price: true, stock: true, imageUrl: true } },
        },
      },
      Payment: { orderBy: { createdAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "desc" } },
      deliveryZone: true,
      deliveryMethod: true,
      deliveryAssignments: {
        include: {
          deliverer: { include: { user: { select: { id: true, name: true, phone: true, email: true } } } },
          method: true,
        },
        orderBy: { assignedAt: "desc" },
      },
      feeRecord: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) throw new Error("ORDER_NOT_FOUND");
  return order;
}