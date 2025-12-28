import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listActivePromotions() {
    const now = new Date();

    return await prisma.promotion.findMany({
        where: {
            isActive: true,
            startsAt: { lte: now },
            endsAt: { gte: now }
        },
        include: {
            products: {
                where: { isActive: true },
                take: 4, // Limit preview products
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    imageUrl: true,
                    brand: { select: { name: true } }
                }
            },
            _count: {
                select: { products: true }
            }
        },
        orderBy: {
            endsAt: 'asc' // Ending soonest first
        }
    });
}
