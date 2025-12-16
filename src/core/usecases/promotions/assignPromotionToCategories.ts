// src/core/usecases/promotions/assignPromotionToCategories.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function assignPromotionToCategoriesUsecase(
  promotionId: number,
  categoryIds: number[]
) {
  const promo = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promo) throw new Error("PROMOTION_NOT_FOUND");

  return prisma.promotion.update({
    where: { id: promotionId },
    data: {
      categories: {
        set: [],
        connect: categoryIds.map((id) => ({ id }))
      }
    },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });
}
