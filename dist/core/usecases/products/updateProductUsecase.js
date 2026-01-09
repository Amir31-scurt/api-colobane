"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductUsecase = updateProductUsecase;
// src/core/usecases/products/updateProductUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function updateProductUsecase(id, input) {
    const product = await prismaClient_1.prisma.product.findUnique({ where: { id } });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    const updated = await prismaClient_1.prisma.product.update({
        where: { id },
        data: {
            name: input.name ?? product.name,
            description: input.description ?? product.description,
            price: input.price ?? product.price,
            stock: input.stock ?? product.stock,
            imageUrl: input.imageUrl ?? product.imageUrl,
            thumbnailUrl: input.thumbnailUrl ?? product.thumbnailUrl,
            categories: input.categoryIds
                ? {
                    set: [],
                    connect: input.categoryIds.map((id) => ({ id }))
                }
                : undefined
        }
    });
    return updated;
}
