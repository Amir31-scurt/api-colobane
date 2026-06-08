// src/core/usecases/services/catalog/getServiceById.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function getServiceByIdUsecase(serviceId: number) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
    include: {
      category: true,
      provider: {
        include: {
          primaryZone: true,
          zones: { include: { zone: true } },
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { customer: { select: { name: true, avatarUrl: true } } },
          },
          _count: { select: { reviews: true, bookings: true } },
        },
      },
    },
  });
  if (!service) throw new Error("SERVICE_NOT_FOUND");
  return service;
}
