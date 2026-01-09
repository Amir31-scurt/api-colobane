"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavoritesUsecase = getFavoritesUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getFavoritesUsecase(userId) {
    const favorites = await prismaClient_1.prisma.favorite.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    brand: true,
                    images: true,
                    promotions: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return favorites.map((f) => f.product);
}
