"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActivePromotions = listActivePromotions;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listActivePromotions() {
    const now = new Date();
    return await prismaClient_1.prisma.promotion.findMany({
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
                    description: true,
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
