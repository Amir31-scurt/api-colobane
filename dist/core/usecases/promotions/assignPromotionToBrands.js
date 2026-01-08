"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPromotionToBrandsUsecase = assignPromotionToBrandsUsecase;
// src/core/usecases/promotions/assignPromotionToBrands
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function assignPromotionToBrandsUsecase(promotionId, brandIds) {
    const promo = await prismaClient_1.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promo)
        throw new Error("PROMOTION_NOT_FOUND");
    return prismaClient_1.prisma.promotion.update({
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
