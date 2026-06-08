// src/core/usecases/services/offerings/listProviderServices.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function listProviderServicesUsecase(userId: number) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  return prisma.service.findMany({
    where: { providerId: provider.id },
    include: {
      category: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
