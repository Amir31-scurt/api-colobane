"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductUsecase = createProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createProductUsecase(input) {
    const exists = await prismaClient_1.prisma.product.findUnique({
        where: { slug: input.slug }
    });
    if (exists)
        throw new Error("PRODUCT_ALREADY_EXISTS");
    const product = await prismaClient_1.prisma.product.create({
        data: {
            brandId: input.brandId,
            name: input.name,
            slug: input.slug,
            description: input.description,
            imageUrl: input.imageUrl,
            price: input.price,
            stock: input.stock ?? 0,
            categories: input.categoryIds
                ? {
                    connect: input.categoryIds.map((id) => ({ id }))
                }
                : undefined
        },
        include: {
            categories: true
        }
    });
    return product;
}
