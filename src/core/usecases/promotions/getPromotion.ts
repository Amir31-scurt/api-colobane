// src/core/usecases/promotions/getPromotion
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getPromotionUsecase(id: number) {
  const promo = await prisma.promotion.findUnique({
    where: { id },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });

  if (!promo) {
    throw new Error("PROMOTION_NOT_FOUND");
  }

  return promo;
}
