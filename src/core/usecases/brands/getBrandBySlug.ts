// src/core/usecases/brands/getBrandBySlug.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function getBrandBySlugUsecase(slug: string) {
  const brand = await prisma.brand.findUnique({
    where: { slug }
  });

  if (!brand) {
    throw new Error("BRAND_NOT_FOUND");
  }

  return brand;
}
