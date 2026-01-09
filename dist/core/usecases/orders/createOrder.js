"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderUsecase = createOrderUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const calculateFinalPrice_1 = require("../../helpers/calculateFinalPrice");
const orderNumberGenerator_1 = require("../../helpers/orderNumberGenerator");
async function createOrderUsecase(input) {
    const { userId, items } = input;
    if (!items || items.length === 0) {
        throw new Error("EMPTY_ORDER");
    }
    const productIds = items.map((i) => i.productId);
    const products = await prismaClient_1.prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
            brand: { include: { promotions: true } },
            promotions: true,
            categories: { include: { promotions: true } }
        }
    });
    if (products.length !== productIds.length) {
        throw new Error("INVALID_PRODUCT");
    }
    let total = 0;
    const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const promotions = [
            ...(product.promotions ?? []),
            ...(product.brand?.promotions ?? []),
            ...(product.categories ?? []).flatMap((c) => c.promotions ?? [])
        ].map((p) => ({
            discountType: p.discountType,
            discountValue: p.discountValue,
            isActive: p.isActive,
            startsAt: p.startsAt,
            endsAt: p.endsAt
        }));
        const finalUnitPrice = (0, calculateFinalPrice_1.calculateFinalPrice)(product.price, promotions);
        const lineTotal = finalUnitPrice * item.quantity;
        total += lineTotal;
        return {
            productId: product.id,
            quantity: item.quantity,
            unitPrice: finalUnitPrice
        };
    });
    // Generate unique order number
    const orderNumber = await (0, orderNumberGenerator_1.generateUniqueOrderNumber)(prismaClient_1.prisma);
    const order = await prismaClient_1.prisma.order.create({
        data: {
            orderNumber,
            userId,
            totalAmount: total,
            items: {
                create: orderItemsData
            }
        },
        include: {
            items: true
        }
    });
    return order;
}
