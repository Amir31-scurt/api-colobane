// src/core/usecases/services/offerings/createService.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { ServicePriceType } from "@prisma/client";

interface CreateServiceInput {
  userId: number;
  categoryId: number;
  name: string;
  description: string;
  price?: number;
  priceType: ServicePriceType;
  minPrice?: number;
  maxPrice?: number;
  requiresQuote?: boolean;
  images?: string[];
}

export async function createServiceUsecase(input: CreateServiceInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  return prisma.service.create({
    data: {
      providerId: provider.id,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      price: input.price,
      priceType: input.priceType,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      requiresQuote: input.requiresQuote ?? false,
      images: input.images ?? [],
    },
    include: { category: true },
  });
}
