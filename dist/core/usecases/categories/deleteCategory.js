"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryUsecase = deleteCategoryUsecase;
// src/core/usecases/categories/deleteCategory.ts
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function deleteCategoryUsecase(id) {
    const existing = await prismaClient_1.prisma.category.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new Error("CATEGORY_NOT_FOUND");
    }
    // Check if category has products
    const productsCount = await prismaClient_1.prisma.product.count({
        where: {
            categories: {
                some: { id }
            }
        }
    });
    if (productsCount > 0) {
        throw new Error("CATEGORY_HAS_PRODUCTS");
    }
    await prismaClient_1.prisma.category.delete({
        where: { id }
    });
    return { success: true };
}
