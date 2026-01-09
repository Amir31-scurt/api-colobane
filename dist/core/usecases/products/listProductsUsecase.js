"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductsUsecase = listProductsUsecase;
// src/core/usecases/products/listProductsUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listProductsUsecase({ page = 1, limit = 12, search, categoryId, brandId, } = {}) {
    const where = {};
    console.log("listProductsUsecase inputs:", { search, categoryId, brandId });
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { brand: { name: { contains: search, mode: "insensitive" } } },
            { categories: { some: { name: { contains: search, mode: "insensitive" } } } },
        ];
    }
    if (categoryId) {
        where.categories = { some: { id: categoryId } };
    }
    if (brandId) {
        where.brandId = brandId;
    }
    const skip = (page - 1) * limit;
    console.log("listProductsUsecase WHERE clause:", JSON.stringify(where, null, 2));
    const [total, products] = await Promise.all([
        prismaClient_1.prisma.product.count({ where }),
        prismaClient_1.prisma.product.findMany({
            where,
            skip,
            take: limit,
            include: {
                images: true,
                variants: true,
                brand: true,
                categories: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);
    return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
