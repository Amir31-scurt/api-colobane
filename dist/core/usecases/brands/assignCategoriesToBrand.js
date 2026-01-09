"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCategoriesToBrandUsecase = assignCategoriesToBrandUsecase;
// src/core/usecases/brands/assignCategoriesToBrand
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function assignCategoriesToBrandUsecase(brandId, categoryIds) {
    const brand = await prismaClient_1.prisma.brand.findUnique({
        where: { id: brandId }
    });
    if (!brand)
        throw new Error("BRAND_NOT_FOUND");
    return prismaClient_1.prisma.brand.update({
        where: { id: brandId },
        data: {
            categories: {
                set: [],
                connect: categoryIds.map((id) => ({ id }))
            }
        },
        include: { categories: true }
    });
}
