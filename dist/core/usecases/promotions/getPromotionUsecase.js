"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotionUsecase = getPromotionUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getPromotionUsecase(id) {
    const promo = await prismaClient_1.prisma.promotion.findUnique({
        where: { id },
        include: {
            products: true,
            brands: true,
            categories: true
        }
    });
    if (!promo) {
        throw new Error("PROMOTION_NOT_FOUND");
    }
    return promo;
}
