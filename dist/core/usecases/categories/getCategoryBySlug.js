"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryBySlugUsecase = getCategoryBySlugUsecase;
// src/core/usecases/categories/getCategoryBySlug
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getCategoryBySlugUsecase(slug) {
    const category = await prismaClient_1.prisma.category.findUnique({
        where: { slug }
    });
    if (!category)
        throw new Error("CATEGORY_NOT_FOUND");
    return category;
}
