import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function assignPromotionToBrandsUsecase(promotionId: number, brandIds: number[]) {
  const promo = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promo) throw new Error("PROMOTION_NOT_FOUND");

  return prisma.promotion.update({
    where: { id: promotionId },
    data: {
      brands: {
        set: [],
        connect: brandIds.map((id) => ({ id }))
      }
    },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });
}
