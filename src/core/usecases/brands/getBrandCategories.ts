// src/core/usecases/brands/getBrandCategories
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getBrandCategoriesUsecase(brandId: number) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { categories: true }
  });

  if (!brand) throw new Error("BRAND_NOT_FOUND");

  return brand.categories;
}
