import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { FeeType, FeeTarget } from "@prisma/client";

export interface AppliedFee {
  name: string;
  type: FeeType;
  target: FeeTarget;
  value: number;
  appliedAmount: number;
  feeId?: number;
}

export async function calculateFeesForOrderUsecase(orderId: number, paymentProvider?: string): Promise<AppliedFee[]> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const fees = await prisma.marketplaceFee.findMany({ where: { isActive: true } });

  const applied: AppliedFee[] = [];

  for (const fee of fees) {
    let appliedAmount = 0;

    if (fee.target === "ORDER") {
      if (fee.type === "PERCENTAGE") {
        appliedAmount = order.totalAmount * (fee.value / 100);
      } else {
        appliedAmount = fee.value;
      }
    }

    if (fee.target === "PAYMENT_PROVIDER") {
      if (paymentProvider === "WAVE" || paymentProvider === "ORANGE_MONEY") {
        appliedAmount = fee.value;
      }
    }

    if (fee.target === "SELLER") {
      // optional future feature
      continue;
    }

    if (appliedAmount > 0) {
      applied.push({
        feeId: fee.id,
        name: fee.name,
        type: fee.type,
        target: fee.target,
        value: fee.value,
        appliedAmount
      });
    }
  }

  return applied;
}
