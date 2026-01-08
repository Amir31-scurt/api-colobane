"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerGetBrandUsecase = sellerGetBrandUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function sellerGetBrandUsecase(userId) {
    const brand = await prismaClient_1.prisma.brand.findFirst({
        where: { ownerId: userId }
    });
    if (!brand)
        return null; // Or throw error? Null is fine, frontend handles "Create Brand" maybe.
    return brand;
}
