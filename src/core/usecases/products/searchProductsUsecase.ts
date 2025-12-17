// src/core/usecases/products/searchProductsUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";

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
