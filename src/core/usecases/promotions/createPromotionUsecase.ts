import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export type DiscountType = "PERCENT" | "AMOUNT";

export interface CreatePromotionInput {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: Date;
  endsAt: Date;
  isActive?: boolean;
  productIds?: number[];
  brandIds?: number[];
  categoryIds?: number[];
}

export async function createPromotionUsecase(input: CreatePromotionInput) {
  const promotion = await prisma.promotion.create({
    data: {
      name: input.name,
      description: input.description,
      discountType: input.discountType,
      discountValue: input.discountValue,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isActive: input.isActive ?? true,
      products: input.productIds
        ? { connect: input.productIds.map((id) => ({ id })) }
        : undefined,
      brands: input.brandIds
        ? { connect: input.brandIds.map((id) => ({ id })) }
        : undefined,
      categories: input.categoryIds
        ? { connect: input.categoryIds.map((id) => ({ id })) }
        : undefined
    },
    include: {
      products: true,
      brands: true,
      categories: true
    }
  });

  return promotion;
}
