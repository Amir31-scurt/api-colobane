// src/core/usecases/categories/listCategories
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listCategoriesUsecase() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" }
  });
}
