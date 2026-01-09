"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerDeleteProductUsecase = sellerDeleteProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
/**
 * Usecase to delete a product owned by a seller.
 * Ownership is verified by the middleware, but we double check here for safety.
 */
async function sellerDeleteProductUsecase(userId, productId) {
    // Verify ownership one last time
    const product = await prismaClient_1.prisma.product.findUnique({
        where: { id: productId },
        include: { brand: true }
    });
    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }
    if (product.brand.ownerId !== userId) {
        throw new Error("FORBIDDEN");
    }
    // Delete the product
    // Note: If there are dependencies (like OrderItems), we might want to deactivate instead
    // But for now, we follow the request to delete.
    // Prisma will handle relations depending on onUpdate/onDelete constraints.
    return await prismaClient_1.prisma.product.delete({
        where: { id: productId }
    });
}
