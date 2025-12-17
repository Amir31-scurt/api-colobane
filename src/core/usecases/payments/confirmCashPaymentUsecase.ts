import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { NotificationType } from "../../constants/notificationTypes";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { sendNotification } from "../../services/notificationService";
import { calculateFeesForOrderUsecase } from "../fees/calculateFeesForOrderUsecase";
import { saveOrderFeesUsecase } from "../fees/saveOrderFeesUsecase";

export async function confirmCashPaymentUsecase(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { Payment: true }
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const cashPayment = order.Payment.find(
    (p) => p.provider === "CASH" && p.status === "WAITING_CONFIRMATION"
  );

  if (!cashPayment) {
    throw new Error("CASH_PAYMENT_NOT_FOUND");
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: cashPayment.id },
      data: { status: "PAID" }
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    })
  ]);

  const content = buildNotificationContent({
    type: NotificationType.ORDER_PAID,
    orderId,
    status
  });
  
  await sendNotification({
    userId: order.userId,
    type: NotificationType.ORDER_PAID,
    title: content.title,
    message: content.message,
    metadata: { orderId, status }
  });

  const fees = await calculateFeesForOrderUsecase(orderId, "WAVE");
  await saveOrderFeesUsecase(orderId, fees);

  return true;
}
