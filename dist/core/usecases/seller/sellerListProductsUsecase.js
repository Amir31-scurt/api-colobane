"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerListProductsUsecase = sellerListProductsUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function sellerListProductsUsecase(sellerId, page, pageSize, search, status, stock, categoryId) {
    const skip = (page - 1) * pageSize;
    const whereCondition = {
        brand: {
            ownerId: sellerId,
        },
    };
    if (categoryId) {
        whereCondition.categories = {
            some: { id: categoryId }
        };
    }
    if (search) {
        whereCondition.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    if (status) {
        whereCondition.isActive = status === "active";
    }
    if (stock === "in_stock") {
        whereCondition.stock = { gt: 0 };
    }
    else if (stock === "out_of_stock") {
        whereCondition.stock = 0;
    }
    const [products, total] = await Promise.all([
        prismaClient_1.prisma.product.findMany({
            where: whereCondition,
            skip,
            take: pageSize,
            include: {
                brand: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        prismaClient_1.prisma.product.count({ where: whereCondition }),
    ]);
    return {
        items: products,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
