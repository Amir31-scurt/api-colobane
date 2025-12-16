// src/core/usecases/products/getProductUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function getProductUsecase(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      variants: true,
      categories: true,
      promotions: true,
      brand: {
        include: { promotions: true }
      }
    }
  });

  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  return product;
}
