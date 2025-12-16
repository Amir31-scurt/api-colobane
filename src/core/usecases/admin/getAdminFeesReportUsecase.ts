import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function getAdminFeesReportUsecase() {
  const records = await prisma.feeRecord.findMany({
    include: {
      order: true
    }
  });

  const byName = records.reduce<Record<string, number>>((acc: any, r: any) => {
    acc[r.name] = (acc[r.name] || 0) + r.appliedAmount;
    return acc;
  }, {});

  return {
    totalFees: records.reduce((s: any, r: any) => s + r.appliedAmount, 0),
    breakdown: byName,
    records
  };
}
