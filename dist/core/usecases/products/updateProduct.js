"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductUsecase = updateProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function updateProductUsecase(slug, input) {
    const product = await prismaClient_1.prisma.product.findUnique({ where: { slug } });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    return prismaClient_1.prisma.product.update({
        where: { slug },
        data: input,
        include: { categories: true }
    });
}
