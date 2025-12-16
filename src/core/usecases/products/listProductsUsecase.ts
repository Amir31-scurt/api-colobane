// src/core/usecases/products/listProductsUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

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
