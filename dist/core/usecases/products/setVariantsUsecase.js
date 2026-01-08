"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVariantsUsecase = setVariantsUsecase;
// src/core/usecases/products/setVariantsUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function setVariantsUsecase(productId, variants) {
    if (!variants || variants.length === 0) {
        throw new Error("AT_LEAST_ONE_VARIANT_REQUIRED");
    }
    variants.forEach(v => {
        if (v.stock === undefined || v.stock === null) {
            throw new Error("VARIANT_STOCK_REQUIRED");
        }
    });
    // On remplace toutes les variantes pour simplifier la gestion
    await prismaClient_1.prisma.productVariant.deleteMany({ where: { productId } });
    const data = variants.map((v) => ({
        productId,
        name: v.name,
        price: v.price ?? null,
        stock: v.stock,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        imageUrl: v.imageUrl ?? null,
        thumbnailUrl: v.thumbnailUrl ?? null
    }));
    return prismaClient_1.prisma.productVariant.createMany({ data });
}
