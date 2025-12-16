import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export interface ConfirmPaymentInput {
  paymentId: number;
  success: boolean;
  externalRef?: string;
}

export async function confirmPaymentUsecase(input: ConfirmPaymentInput) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: { order: true }
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  const newStatus = input.success ? "SUCCESS" : "FAILED";

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      externalRef: input.externalRef
    }
  });

  // Si le paiement est OK → on met la commande en PAID
  if (newStatus === "SUCCESS") {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" }
    });

    // On peut aussi créer une notification
    await prisma.notification.create({
      data: {
        userId: payment.order.userId,
        type: "ORDER_PAID",
        title: "Paiement confirmé",
        message: `Votre commande #${payment.orderId} a été payée avec succès.`,
        data: {
          orderId: payment.orderId,
          paymentId: payment.id
        }
      }
    });
  }

  return updatedPayment;
}
