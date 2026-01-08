"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionUsecase = updatePromotionUsecase;
// src/core/usecases/promotions/updatePromotion
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function updatePromotionUsecase(id, input) {
    const promo = await prismaClient_1.prisma.promotion.findUnique({ where: { id } });
    if (!promo) {
        throw new Error("PROMOTION_NOT_FOUND");
    }
    const updated = await prismaClient_1.prisma.promotion.update({
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
