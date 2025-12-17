import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listPromotionsUsecase() {
  return prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });
}
