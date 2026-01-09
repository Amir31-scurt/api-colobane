"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setImagesUsecase = setImagesUsecase;
// src/core/usecases/products/setImagesUsecase
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function setImagesUsecase(productId, urls) {
    await prismaClient_1.prisma.productImage.deleteMany({ where: { productId } });
    const data = urls.map((url, index) => ({
        url,
        position: index,
        productId
    }));
    return prismaClient_1.prisma.productImage.createMany({ data });
}
