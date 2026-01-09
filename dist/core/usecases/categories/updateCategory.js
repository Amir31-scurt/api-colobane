"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryUsecase = updateCategoryUsecase;
// src/core/usecases/categories/updateCategory.ts
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function updateCategoryUsecase(id, input) {
    const existing = await prismaClient_1.prisma.category.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new Error("CATEGORY_NOT_FOUND");
    }
    const category = await prismaClient_1.prisma.category.update({
        where: { id },
        data: {
            ...input,
        }
    });
    return category;
}
