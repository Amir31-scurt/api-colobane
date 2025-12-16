import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import { NotificationType } from "../../constants/notificationTypes.ts";
import { sendNotification } from "../../services/notificationService.ts";
import { calculateFeesForOrderUsecase } from "../fees/calculateFeesForOrderUsecase.ts";
import { saveOrderFeesUsecase } from "../fees/saveOrderFeesUsecase.ts";

export async function confirmCashPaymentUsecase(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true }
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const cashPayment = order.payments.find(
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
