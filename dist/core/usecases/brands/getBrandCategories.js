"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandCategoriesUsecase = getBrandCategoriesUsecase;
// src/core/usecases/brands/getBrandCategories
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getBrandCategoriesUsecase(brandId) {
    const brand = await prismaClient_1.prisma.brand.findUnique({
        where: { id: brandId },
        include: { categories: true }
    });
    if (!brand)
        throw new Error("BRAND_NOT_FOUND");
    return brand.categories;
}
