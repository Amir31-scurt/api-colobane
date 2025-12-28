import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function toggleFavoriteUsecase(userId: number, productId: number) {
    const existing = await prisma.favorite.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    if (existing) {
        await prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        return { isFavorite: false };
    } else {
        await prisma.favorite.create({
            data: {
                userId,
                productId,
            },
        });
        return { isFavorite: true };
    }
}
