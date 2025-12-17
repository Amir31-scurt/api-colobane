// src/core/usecases/products/listProductsUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listProductsUsecase() {
  return prisma.product.findMany({
    include: {
      images: true,
      variants: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
