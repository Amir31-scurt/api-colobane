import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function togglePromotionUsecase(id: number, isActive: boolean) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) throw new Error("PROMOTION_NOT_FOUND");

  return prisma.promotion.update({
    where: { id },
    data: { isActive },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });
}
