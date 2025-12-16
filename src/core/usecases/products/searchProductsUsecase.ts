// src/core/usecases/products/searchProductsUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function searchProductsUsecase(q: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    },
    include: {
      images: true,
      brand: true
    }
  });
}
