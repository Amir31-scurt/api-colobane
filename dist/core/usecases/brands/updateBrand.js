"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandUsecase = updateBrandUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function updateBrandUsecase(input) {
    const { brandId, userId, ...data } = input;
    // 1. Check if brand exists
    const brand = await prismaClient_1.prisma.brand.findUnique({
        where: { id: brandId }
    });
    if (!brand)
        throw new Error("BRAND_NOT_FOUND");
    // 2. Authorization: Only owner can update
    if (brand.ownerId !== userId) {
        // Check if user is admin (optional, for now keep strict ownership)
        // For now assuming only owner updates via this route
        throw new Error("UNAUTHORIZED");
    }
    // 3. Update
    const updatedBrand = await prismaClient_1.prisma.brand.update({
        where: { id: brandId },
        data: {
            ...data,
        }
    });
    return updatedBrand;
}
