// src/core/usecases/brands/getBrandBySlug
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getBrandBySlugUsecase(slug: string) {
  const brand = await prisma.brand.findUnique({
    where: { slug }
  });

  if (!brand) {
    throw new Error("BRAND_NOT_FOUND");
  }

  return brand;
}
