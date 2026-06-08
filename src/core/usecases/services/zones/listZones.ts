// src/core/usecases/services/zones/listZones.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function listZonesUsecase() {
  return prisma.serviceZone.findMany({
    where: { isActive: true },
    orderBy: [{ city: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { providers: true } },
    },
  });
}
