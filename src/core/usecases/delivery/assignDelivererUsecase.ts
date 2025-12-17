import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { NotificationType } from "../../constants/notificationTypes";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { sendNotification } from "../../services/notificationService";

interface AssignDelivererInput {
  orderId: number;
  delivererId: number;
  methodId?: number;
}

export async function assignDelivererUsecase(input: AssignDelivererInput) {
  const { orderId, delivererId, methodId } = input;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const deliverer = await prisma.deliverer.findUnique({ where: { id: delivererId } });
  if (!deliverer || !deliverer.isActive) throw new Error("DELIVERER_NOT_AVAILABLE");

  const assignment = await prisma.deliveryAssignment.create({
    data: {
      orderId,
      delivererId,
      methodId: methodId ?? (order as any).deliveryMethodId
    },
    include: {
      deliverer: { include: { user: true } },
      order: true
    }
  });

  const content = buildNotificationContent({
    type: NotificationType.DELIVERY_ASSIGNED,
    orderId,
  });
  
  await sendNotification({
    userId: assignment.deliverer.userId,
    type: NotificationType.DELIVERY_ASSIGNED,
    title: content.title,
    message: content.message,
    metadata: { orderId : orderId }
  });
  

  return assignment;
}
