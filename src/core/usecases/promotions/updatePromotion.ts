// src/core/usecases/promotions/updatePromotion
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import type { DiscountType } from "./createPromotion";

export interface UpdatePromotionInput {
  name?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive?: boolean;
}

export async function updatePromotionUsecase(id: number, input: UpdatePromotionInput) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) {
    throw new Error("PROMOTION_NOT_FOUND");
  }

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      name: input.name ?? promo.name,
      description: input.description ?? promo.description,
      discountType: input.discountType ?? promo.discountType,
      discountValue: input.discountValue ?? promo.discountValue,
      startsAt: input.startsAt ?? promo.startsAt,
      endsAt: input.endsAt ?? promo.endsAt,
      isActive: input.isActive ?? promo.isActive
    },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });

  return updated;
}
