// src/core/usecases/services/providers/getMyProvider.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function getMyProviderUsecase(userId: number) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId },
    include: {
      primaryZone: true,
      zones: { include: { zone: true } },
      wallet: true,
      _count: {
        select: { services: true, bookings: true, reviews: true },
      },
    },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");
  return provider;
}
