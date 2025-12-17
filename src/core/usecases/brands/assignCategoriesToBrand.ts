// src/core/usecases/brands/assignCategoriesToBrand
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function assignCategoriesToBrandUsecase(brandId: number, categoryIds: number[]) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId }
  });

  if (!brand) throw new Error("BRAND_NOT_FOUND");

  return prisma.brand.update({
    where: { id: brandId },
    data: {
      categories: {
        set: [],
        connect: categoryIds.map((id) => ({ id }))
      }
    },
    include: { categories: true }
  });
}
