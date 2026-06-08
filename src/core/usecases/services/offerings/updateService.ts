// src/core/usecases/services/offerings/updateService.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { ServicePriceType } from "@prisma/client";

interface UpdateServiceInput {
  serviceId: number;
  userId: number;
  name?: string;
  description?: string;
  price?: number;
  priceType?: ServicePriceType;
  minPrice?: number;
  maxPrice?: number;
  requiresQuote?: boolean;
  images?: string[];
  isActive?: boolean;
  categoryId?: number;
}

export async function updateServiceUsecase(input: UpdateServiceInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service) throw new Error("SERVICE_NOT_FOUND");
  if (service.providerId !== provider.id) throw new Error("UNAUTHORIZED");

  const { serviceId, userId, ...fields } = input;

  return prisma.service.update({
    where: { id: serviceId },
    data: fields,
    include: { category: true },
  });
}
