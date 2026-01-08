"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPromotionToCategoriesUsecase = assignPromotionToCategoriesUsecase;
// src/core/usecases/promotions/assignPromotionToCategories
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function assignPromotionToCategoriesUsecase(promotionId, categoryIds) {
    const promo = await prismaClient_1.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promo)
        throw new Error("PROMOTION_NOT_FOUND");
    return prismaClient_1.prisma.promotion.update({
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
