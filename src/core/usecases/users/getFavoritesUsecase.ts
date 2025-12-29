import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getFavoritesUsecase(userId: number) {
    const favorites = await prisma.favorite.findMany({
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

    return favorites.map((f: any) => f.product);
}
