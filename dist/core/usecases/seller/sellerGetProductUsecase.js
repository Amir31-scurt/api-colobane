"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerGetProductUsecase = sellerGetProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function sellerGetProductUsecase(userId, productId) {
    const product = await prismaClient_1.prisma.product.findUnique({
        where: { id: productId },
        include: {
            brand: true,
            categories: true,
            images: true,
            variants: true,
        }
    });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    // Ensure ownership
    if (product.brand.ownerId !== userId) {
        throw new Error("FORBIDDEN");
    }
    return product;
}
