"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPromotionToProductsUsecase = assignPromotionToProductsUsecase;
// src/core/usecases/promotions/assignPromotionToProducts
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function assignPromotionToProductsUsecase(promotionId, productIds) {
    const promo = await prismaClient_1.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promo)
        throw new Error("PROMOTION_NOT_FOUND");
    return prismaClient_1.prisma.promotion.update({
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
