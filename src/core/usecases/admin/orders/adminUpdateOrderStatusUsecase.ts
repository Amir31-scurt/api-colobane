import { OrderStatus } from "@prisma/client";
import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminUpdateOrderStatusUsecase(params: {
  actorId: number;
  orderId: number;
  status: OrderStatus;
}) {
  const { actorId, orderId, status } = params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      action: "ORDER_STATUS_UPDATED",
      actorId,
      entityType: "Order",
      entityId: String(orderId),
      meta: { from: order.status, to: status },
    },
  });

  return updated;
}
