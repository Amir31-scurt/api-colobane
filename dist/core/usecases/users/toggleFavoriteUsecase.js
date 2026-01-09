"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavoriteUsecase = toggleFavoriteUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function toggleFavoriteUsecase(userId, productId) {
    const existing = await prismaClient_1.prisma.favorite.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });
    if (existing) {
        await prismaClient_1.prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        return { isFavorite: false };
    }
    else {
        await prismaClient_1.prisma.favorite.create({
            data: {
                userId,
                productId,
            },
        });
        return { isFavorite: true };
    }
}
