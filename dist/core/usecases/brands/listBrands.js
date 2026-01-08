"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrandsUsecase = listBrandsUsecase;
// src/core/usecases/brands/listBrands
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listBrandsUsecase() {
    return prismaClient_1.prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
    });
}
