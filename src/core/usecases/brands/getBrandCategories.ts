// src/core/usecases/brands/getBrandCategories.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function getBrandCategoriesUsecase(brandId: number) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { categories: true }
  });

  if (!brand) throw new Error("BRAND_NOT_FOUND");

  return brand.categories;
}
