"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductsUsecase = listProductsUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listProductsUsecase() {
    return prismaClient_1.prisma.product.findMany({
        where: { isActive: true },
        include: { categories: true, brand: true },
        orderBy: { createdAt: "desc" }
    });
}
