import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function listProductsUsecase() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { categories: true, brand: true },
    orderBy: { createdAt: "desc" }
  });
}
