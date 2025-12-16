import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function assignPromotionToProductsUsecase(promotionId: number, productIds: number[]) {
  const promo = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promo) throw new Error("PROMOTION_NOT_FOUND");

  return prisma.promotion.update({
    where: { id: promotionId },
    data: {
      products: {
        set: [],
        connect: productIds.map((id) => ({ id }))
      }
    },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });
}
