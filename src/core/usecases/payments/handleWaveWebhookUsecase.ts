import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { NotificationType } from "../../constants/notificationTypes";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { sendNotification } from "../../services/notificationService";
import { calculateFeesForOrderUsecase } from "../fees/calculateFeesForOrderUsecase";
import { saveOrderFeesUsecase } from "../fees/saveOrderFeesUsecase";

interface WaveWebhookPayload {
  providerRef: string;
  status: "SUCCESS" | "FAILED";
  amount: number;
}

export async function handleWaveWebhookUsecase(payload: WaveWebhookPayload) {
  const payment = await prisma.payment.findFirst({
    where: {
      providerRef: payload.providerRef,
      provider: "WAVE"
    },
    include: { order: true }
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payload.status === "SUCCESS") {
    const order = await prisma.order.findUnique({
        where: { id: payment.orderId }
    });
  
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          amount: payload.amount
        }
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      })
    ]);

    const content = buildNotificationContent({
        type: NotificationType.ORDER_PAID,
        orderId: payment.orderId,
        status
    });
      
    await sendNotification({
        userId: order.userId,
        type: NotificationType.ORDER_PAID,
        title: content.title,
        message: content.message,
        metadata: { orderId : payment.orderId, status }
    });
    
    const fees = await calculateFeesForOrderUsecase(payment.orderId, "WAVE");
    await saveOrderFeesUsecase(payment.orderId, fees);

  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED"
      }
    });
  }

  return true;
}
