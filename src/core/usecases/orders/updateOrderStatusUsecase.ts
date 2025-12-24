import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { sendNotification } from "../../services/notificationService";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { NotificationType } from "../../constants/notificationTypes";

interface UpdateOrderStatusInput {
  orderId: number;
  status: OrderStatus;
  changedByUserId?: number;
  note?: string;
  nextStatus?: any
}

export async function updateOrderStatusUsecase(input: UpdateOrderStatusInput) {
  const { orderId, nextStatus, changedByUserId, note } = input;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const currentStatus = order.status;

  // ❌ États finaux bloqués
  if (
    currentStatus === OrderStatus.COMPLETED ||
    currentStatus === OrderStatus.CANCELLED
  ) {
    throw new Error("ORDER_ALREADY_FINALIZED");
  }

  // 🔒 Matrice officielle des transitions autorisées
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
    PAID: [OrderStatus.PROCESSING],
    PROCESSING: [OrderStatus.SHIPPED],
    SHIPPED: [OrderStatus.DELIVERED],
    DELIVERED: [OrderStatus.COMPLETED],
    COMPLETED: [],
    CANCELLED: []
  };

  const allowedNextStatuses = allowedTransitions[currentStatus];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new Error(
      `INVALID_ORDER_STATUS_TRANSITION: ${currentStatus} → ${nextStatus}`
    );
  }

  // 🔐 Règle critique : passage à PAID uniquement si paiement PAID
  if (nextStatus === OrderStatus.PAID) {
    const newOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { Payment: true }
    });
    if (!newOrder) { throw new Error("NO_ORDER_MATCHES_THE_ID") }

    const hasPaidPayment = newOrder.Payment.some(
      (p: any) => p.status === PaymentStatus.PAID
    );

    if (!hasPaidPayment) {
      throw new Error("ORDER_CANNOT_BE_MARKED_PAID_WITHOUT_PAYMENT");
    }
  }

  const actor = await prisma.order.findUnique({
    where: { id: order.userId },
    include: { user: true }
  });

  const actorRole = actor?.user.role

  // 🔐 Seul l’ADMIN peut annuler après paiement
  if (
    nextStatus === OrderStatus.CANCELLED &&
    currentStatus !== OrderStatus.PENDING &&
    actorRole !== "ADMIN"
  ) {
    throw new Error("ONLY_ADMIN_CAN_CANCEL_AFTER_PAYMENT");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const orderUpdated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        paidAt:
          status === "PAID" && !order.paidAt
            ? new Date()
            : order.paidAt
      }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: orderId,
        status: nextStatus,
        note: note ?? null,
        changedBy: changedByUserId ?? null
      }
    });

    let type = NotificationType.ORDER_STATUS_CHANGED;
    if (nextStatus === "SHIPPED") {
      type = NotificationType.ORDER_SHIPPED;
    }

    const content = buildNotificationContent({
      type,
      orderId,
      status: nextStatus,
    });

    await sendNotification({
      userId: order.userId,
      type,
      title: content.title,
      message: content.message,
      metadata: { orderId, status: nextStatus }
    });

    return orderUpdated;
  });

  return updated;
}
