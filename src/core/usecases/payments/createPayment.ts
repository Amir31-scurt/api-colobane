import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export interface CreatePaymentInput {
  orderId: number;
  provider: "WAVE" | "ORANGE_MONEY" | "TEST";
}

export async function createPaymentUsecase(input: CreatePaymentInput) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId }
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: input.provider,
      status: "PENDING",
      amount: order.totalAmount
    }
  });

  return payment;
}
