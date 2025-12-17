import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { AppliedFee } from "./calculateFeesForOrderUsecase";

export async function saveOrderFeesUsecase(orderId: number, fees: AppliedFee[]) {
  return prisma.feeRecord.createMany({
    data: fees.map(f => ({
      orderId,
      feeId: f.feeId ?? null,
      name: f.name,
      type: f.type,
      target: f.target,
      value: f.value,
      appliedAmount: f.appliedAmount
    }))
  });
}
