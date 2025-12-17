import { prisma } from "../../../infrastructure/prisma/prismaClient";
import type { OrderStatus } from "@prisma/client";
import { sendNotification } from "../../services/notificationService";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { NotificationType } from "../../constants/notificationTypes";

interface UpdateOrderStatusInput {
    orderId: number;
    status: OrderStatus;
    changedByUserId?: number;
    note?: string;
}

export async function updateOrderStatusUsecase(input: UpdateOrderStatusInput) {
    const { orderId, status, changedByUserId, note } = input;
  
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
  
    const updated = await prisma.$transaction(async (tx) => {
      const orderUpdated = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          paidAt:
            status === "PAID" && !order.paidAt
              ? new Date()
              : order.paidAt
        }
      });
  
      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          status,
          note: note ?? null,
          changedBy: changedByUserId ?? null
        }
      });
      
      const content = buildNotificationContent({
        type: NotificationType.ORDER_STATUS_CHANGED,
        orderId,
        status
      });

      await sendNotification({
        userId: order.userId,
        type: NotificationType.ORDER_STATUS_CHANGED,
        title: content.title,
        message: content.message,
        metadata: { orderId, status }
      });
  
      return orderUpdated;
    });
  
    return updated;
}
