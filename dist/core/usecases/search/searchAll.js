"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAllUsecase = searchAllUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function searchAllUsecase(query) {
    if (!query || query.trim().length === 0) {
        return { brands: [], products: [], categories: [] };
    }
    const q = query.trim();
    const [brands, products, categories] = await Promise.all([
        prismaClient_1.prisma.brand.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } }
                ]
            },
            take: 20
        }),
        prismaClient_1.prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } }
                ],
                isActive: true
            },
            include: { brand: true, categories: true },
            take: 50
        }),
        prismaClient_1.prisma.category.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } }
                ]
            },
            take: 20
        })
    ]);
    return { brands, products, categories };
}
