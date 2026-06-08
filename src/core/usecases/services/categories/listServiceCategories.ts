// src/core/usecases/services/categories/listServiceCategories.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function listServiceCategoriesUsecase() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { services: true } },
    },
  });
}
