"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductsUsecase = searchProductsUsecase;
// src/core/usecases/products/searchProductsUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function searchProductsUsecase(q) {
    return prismaClient_1.prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } }
            ]
        },
        include: {
            images: true,
            brand: true
        }
    });
}
