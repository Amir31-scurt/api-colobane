"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSearchProductsUsecase = advancedSearchProductsUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function advancedSearchProductsUsecase(input) {
    const { query, phone, minPrice, maxPrice, categoryIds, brandIds, hasPromotion } = input;
    // filtre basique en Prisma
    const products = await prismaClient_1.prisma.product.findMany({
        where: {
            AND: [
                query
                    ? {
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { description: { contains: query, mode: "insensitive" } }
                        ]
                    }
                    : {},
                minPrice ? { price: { gte: minPrice } } : {},
                maxPrice ? { price: { lte: maxPrice } } : {},
                brandIds ? { brandId: { in: brandIds } } : {},
                categoryIds
                    ? {
                        categories: {
                            some: { id: { in: categoryIds } }
                        }
                    }
                    : {},
                phone
                    ? {
                        orderItems: {
                            some: {
                                order: {
                                    user: {
                                        phone: { contains: phone }
                                    }
                                }
                            }
                        }
                    }
                    : {}
            ]
        },
        include: {
            images: true,
            brand: true,
            categories: true,
            promotions: true,
            variants: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    // si hasPromotion → filtrer en mémoire via promotions actives
    const now = new Date();
    const filtered = hasPromotion
        ? products.filter((p) => (p.promotions ?? []).some((promo) => promo.isActive &&
            promo.startsAt <= now &&
            promo.endsAt >= now))
        : products;
    return filtered;
}
