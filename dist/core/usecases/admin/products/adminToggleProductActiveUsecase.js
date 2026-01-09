"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminToggleProductActiveUsecase = adminToggleProductActiveUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminToggleProductActiveUsecase(params) {
    const { actorId, productId, isActive } = params;
    const product = await prismaClient_1.prisma.product.findUnique({ where: { id: productId } });
    if (!product)
        throw new Error("PRODUCT_NOT_FOUND");
    const updated = await prismaClient_1.prisma.product.update({
        where: { id: productId },
        data: { isActive },
    });
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: "PRODUCT_TOGGLED",
            actorId,
            entityType: "Product",
            entityId: String(productId),
            meta: { from: product.isActive, to: isActive },
        },
    });
    return updated;
}
