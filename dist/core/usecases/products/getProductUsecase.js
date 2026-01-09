"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductUsecase = getProductUsecase;
// src/core/usecases/products/getProductUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getProductUsecase(slug) {
    const product = await prismaClient_1.prisma.product.findUnique({
        where: { slug },
        include: {
            images: true,
            variants: true,
            categories: true,
            promotions: true,
            brand: {
                include: { promotions: true }
            }
        }
    });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    return product;
}
