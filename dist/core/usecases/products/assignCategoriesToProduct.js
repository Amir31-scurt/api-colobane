"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCategoriesToProductUsecase = assignCategoriesToProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function assignCategoriesToProductUsecase(productSlug, categoryIds) {
    const product = await prismaClient_1.prisma.product.findUnique({
        where: { slug: productSlug }
    });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    return prismaClient_1.prisma.product.update({
        where: { slug: productSlug },
        data: {
            categories: {
                set: [], // reset les anciennes catégories
                connect: categoryIds.map((id) => ({ id }))
            }
        },
        include: { categories: true }
    });
}
