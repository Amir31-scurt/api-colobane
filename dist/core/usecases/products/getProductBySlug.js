"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductBySlugUsecase = getProductBySlugUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getProductBySlugUsecase(slug) {
    const product = await prismaClient_1.prisma.product.findUnique({
        where: { slug },
        include: {
            categories: true,
            brand: true,
            variants: true
        }
    });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    return product;
}
