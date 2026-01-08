"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryUsecase = createCategoryUsecase;
// src/core/usecases/categories/createCategory
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createCategoryUsecase(input) {
    const existing = await prismaClient_1.prisma.category.findUnique({
        where: { slug: input.slug }
    });
    if (existing) {
        throw new Error("CATEGORY_ALREADY_EXISTS");
    }
    const category = await prismaClient_1.prisma.category.create({
        data: {
            name: input.name,
            slug: input.slug,
            isGlobal: input.isGlobal ?? true
        }
    });
    return category;
}
