"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerUpdateProductUsecase = sellerUpdateProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function sellerUpdateProductUsecase(userId, productId, data) {
    // Ownership check is done by middleware
    const { categoryId, variants, ...rest } = data;
    const product = await prismaClient_1.prisma.product.update({
        where: { id: productId },
        data: {
            ...rest,
            ...(categoryId && {
                categories: {
                    set: [{ id: categoryId }]
                }
            }),
            ...(variants && {
                variants: {
                    deleteMany: {},
                    create: variants.map(v => ({
                        name: v.name,
                        price: v.price ?? null,
                        stock: v.stock,
                        option1: v.option1,
                        option2: v.option2,
                        option3: v.option3,
                        imageUrl: v.imageUrl ?? null,
                        thumbnailUrl: v.thumbnailUrl ?? null
                    }))
                }
            }),
            updatedAt: new Date(),
        },
    });
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: "PRODUCT_UPDATED",
            actorId: userId,
            entityType: "Product",
            entityId: productId.toString(),
            meta: data,
        }
    });
    return product;
}
