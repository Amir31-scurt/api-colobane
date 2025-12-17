import { prisma } from "../../../infrastructure/prisma/prismaClient";
import type { DeliveryStatus, OrderStatus } from "@prisma/client";
import { updateOrderStatusUsecase } from "../orders/updateOrderStatusUsecase";
import { sendNotification } from "../../services/notificationService";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { NotificationType } from "../../constants/notificationTypes";

interface UpdateDeliveryStatusInput {
  assignmentId: number;
  status: DeliveryStatus;
  changedByUserId?: number;
}

export async function updateDeliveryStatusUsecase(input: UpdateDeliveryStatusInput) {
  const { assignmentId, status, changedByUserId } = input;

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: assignmentId },
    include: { order: true }
  });

  if (!assignment) throw new Error("ASSIGNMENT_NOT_FOUND");

  const updatedAssignment = await prisma.$transaction(async (tx) => {
    const data: any = { status };

    if (status === "PICKED_UP") {
      data.pickedAt = new Date();
    }
    if (status === "DELIVERED") {
      data.deliveredAt = new Date();
    }

    const updated = await tx.deliveryAssignment.update({
      where: { id: assignmentId },
      data
    });

    // synchroniser statut commande
    let newOrderStatus: OrderStatus | null = null;
    if (status === "PICKED_UP") {
      newOrderStatus = "SHIPPED";
    }
    if (status === "IN_TRANSIT") {
        const content = buildNotificationContent({
            type: NotificationType.DELIVERY_IN_TRANSIT,
            orderId: assignment.orderId, status
        });
        await sendNotification({
            userId: assignment.order.userId,
            type: NotificationType.DELIVERY_IN_TRANSIT,
            title: content.title,
            message: content.message,
            metadata: { orderId: assignment.orderId, status }
        });
        newOrderStatus = "SHIPPED";
    }   
    if (status === "DELIVERED") {
        const content = buildNotificationContent({
            type: NotificationType.ORDER_DELIVERED,
            orderId: assignment.orderId, status
          });
        await sendNotification({
            userId: assignment.order.userId,
            type: NotificationType.ORDER_DELIVERED,
            title: content.title,
            message: content.message,
            metadata: { orderId: assignment.orderId, status }
        });        
        newOrderStatus = "DELIVERED";
    }

    if (newOrderStatus) {
      await updateOrderStatusUsecase({
        orderId: assignment.orderId,
        status: newOrderStatus,
        changedByUserId,
        note: `MàJ via livraison: ${status}`
      });
    }

    return updated;
  });

  return updatedAssignment;
}
