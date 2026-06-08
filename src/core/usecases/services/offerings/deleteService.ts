// src/core/usecases/services/offerings/deleteService.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function deleteServiceUsecase(serviceId: number, userId: number) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("SERVICE_NOT_FOUND");
  if (service.providerId !== provider.id) throw new Error("UNAUTHORIZED");

  // Soft delete: just deactivate
  return prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  });
}
