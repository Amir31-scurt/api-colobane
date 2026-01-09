"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionUsecase = createPromotionUsecase;
// src/core/usecases/promotions/createPromotion
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createPromotionUsecase(input) {
    const promotion = await prismaClient_1.prisma.promotion.create({
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
