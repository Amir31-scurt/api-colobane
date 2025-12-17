// src/core/usecases/categories/getCategoryBySlug
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getCategoryBySlugUsecase(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) throw new Error("CATEGORY_NOT_FOUND");

  return category;
}
