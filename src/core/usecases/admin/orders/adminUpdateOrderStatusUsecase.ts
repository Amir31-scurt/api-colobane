import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminUpdateOrderStatusUsecase(params: {
  actorId: number;
  orderId: number;
  status: string;
  note?: string;
}) {
  const { actorId, orderId, status, note } = params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: status as any,
        note: note || "Admin update",
        changedBy: actorId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "ORDER_STATUS_UPDATED",
        actorId,
        entityType: "Order",
        entityId: String(orderId),
        meta: { from: order.status, to: status, note: note || null },
      },
    });

    return u;
  });

  return updated;
}