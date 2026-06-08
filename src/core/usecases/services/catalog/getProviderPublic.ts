// src/core/usecases/services/catalog/getProviderPublic.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function getProviderPublicUsecase(providerId: number) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    include: {
      primaryZone: true,
      zones: { include: { zone: true } },
      services: {
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: { select: { name: true, avatarUrl: true } } },
      },
      _count: { select: { reviews: true, bookings: true, services: true } },
    },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");
  return provider;
}
