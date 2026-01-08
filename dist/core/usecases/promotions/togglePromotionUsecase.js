"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePromotionUsecase = togglePromotionUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function togglePromotionUsecase(id, isActive) {
    const promo = await prismaClient_1.prisma.promotion.findUnique({ where: { id } });
    if (!promo)
        throw new Error("PROMOTION_NOT_FOUND");
    return prismaClient_1.prisma.promotion.update({
        where: { id },
        data: { isActive },
        include: {
            products: true,
            brands: true,
            categories: true
        }
    });
}
