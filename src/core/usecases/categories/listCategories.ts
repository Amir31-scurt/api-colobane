// src/core/usecases/categories/listCategories.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function listCategoriesUsecase() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" }
  });
}
