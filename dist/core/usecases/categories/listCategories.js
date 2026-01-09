"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategoriesUsecase = listCategoriesUsecase;
// src/core/usecases/categories/listCategories
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listCategoriesUsecase(options) {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 100; // Default large for backwards compat if needed, or stick to standard 10
    const search = options?.search || "";
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search } }, // Case-insensitive handled by DB collation usually, or use mode: 'insensitive' for postgres
            { slug: { contains: search } }
        ];
    }
    const [total, items] = await prismaClient_1.prisma.$transaction([
        prismaClient_1.prisma.category.count({ where }),
        prismaClient_1.prisma.category.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })
    ]);
    return { items, total };
}
