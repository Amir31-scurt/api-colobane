"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFeesForOrderUsecase = calculateFeesForOrderUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function calculateFeesForOrderUsecase(orderId, paymentProvider) {
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            brand: true
                        }
                    }
                }
            }
        }
    });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    const feesConfig = await prismaClient_1.prisma.marketplaceFee.findMany({ where: { isActive: true } });
    const applied = [];
    // Group items by seller
    const itemsBySeller = {};
    for (const item of order.items) {
        const sellerId = item.product.brand.ownerId;
        if (!itemsBySeller[sellerId])
            itemsBySeller[sellerId] = [];
        itemsBySeller[sellerId].push(item);
    }
    for (const sellerIdStr in itemsBySeller) {
        const sellerId = parseInt(sellerIdStr);
        const items = itemsBySeller[sellerId];
        const sellerTotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        for (const fee of feesConfig) {
            let appliedAmount = 0;
            if ((fee.target === "ORDER" || fee.target === "SELLER") && fee.type === "PERCENTAGE") {
                appliedAmount = sellerTotal * (fee.value / 100);
            }
            else if (fee.target === "SELLER" && fee.type === "FIXED") {
                appliedAmount = fee.value;
            }
            if (appliedAmount > 0) {
                applied.push({
                    feeId: fee.id,
                    name: fee.name,
                    type: fee.type,
                    target: fee.target,
                    value: fee.value,
                    appliedAmount,
                    sellerId
                });
            }
        }
    }
    return applied;
}
