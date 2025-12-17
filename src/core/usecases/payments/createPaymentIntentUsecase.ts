import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { PaymentProvider } from "@prisma/client";
import {
  buildWaveCheckoutUrl,
  buildOrangeMoneyCheckoutUrl
} from "../../services/paymentUrlService";
import { createWavePayment } from "../../services/providers/wavePaymentProvider";

export interface CreatePaymentIntentInput {
  userId: number;
  orderId: number;
  provider: PaymentProvider;
}

export interface PaymentIntentResult {
  paymentId: number;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  checkoutUrl?: string;
}

export async function createPaymentIntentUsecase(
  input: CreatePaymentIntentInput
): Promise<PaymentIntentResult> {
  const { userId, orderId, provider } = input;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order || order.userId !== userId) {
    throw new Error("ORDER_NOT_FOUND_OR_FORBIDDEN");
  }

  if (order.status !== "PENDING") {
    throw new Error("ORDER_NOT_PENDING");
  }

  const amount = order.totalAmount;
  const currency = "XOF";

  const payment = await prisma.payment.create({
    data: {
      orderId,
      provider,
      amount,
      currency,
      status:
        provider === "CASH"
          ? "WAITING_CONFIRMATION"
          : "INITIATED"
    }
  });

  let checkoutUrl: string | undefined;

  if (provider === "WAVE") {
    const waveResult = await createWavePayment(amount, currency, payment.id, orderId);

    checkoutUrl = waveResult.url;

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
        providerRef: waveResult.id,
        providerMeta: waveResult
        }
    });
  } else if (provider === "ORANGE_MONEY") {
    checkoutUrl = buildOrangeMoneyCheckoutUrl(payment.id, amount);
  } else if (provider === "CASH") {
    checkoutUrl = undefined;
  }

  if (checkoutUrl) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerMeta: {
          checkoutUrl
        }
      }
    });
  }

  return {
    paymentId: payment.id,
    provider,
    amount,
    currency,
    checkoutUrl
  };
}
