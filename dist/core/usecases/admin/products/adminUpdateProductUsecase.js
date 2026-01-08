"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateProductUsecase = adminUpdateProductUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminUpdateProductUsecase(productId, data) {
    const updateData = {
        price: data.price,
        stock: data.stock,
        name: data.name,
        description: data.description === null
            ? { set: null }
            : data.description,
        ...(data.imageUrl !== null && data.imageUrl !== undefined && {
            imageUrl: data.imageUrl,
        }),
    };
    return prismaClient_1.prisma.product.update({
        where: { id: productId },
        data: updateData,
    });
}
