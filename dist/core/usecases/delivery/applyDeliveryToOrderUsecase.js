"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDeliveryToOrderUsecase = applyDeliveryToOrderUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const calculateDeliveryFeeUsecase_1 = require("./calculateDeliveryFeeUsecase");
async function applyDeliveryToOrderUsecase(input) {
    const { orderId, deliveryZoneId, deliveryMethodId, shippingAddress } = input;
    // 1. Fetch Order Items
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    // 2. Calculate Fee
    // We assume 'deliveryZoneId' passed here is actually the ReferenceLocation ID
    // because calculation requires exact location for distance, and frontend passes locationId.
    const { fee } = await (0, calculateDeliveryFeeUsecase_1.calculateDeliveryFeeUsecase)({
        items: order.items.map(i => ({ productId: i.productId })),
        deliveryMethodId,
        deliveryLocationId: deliveryZoneId
    });
    const updated = await prismaClient_1.prisma.order.update({
        where: { id: orderId },
        data: {
            deliveryLocationId: deliveryZoneId, // Set the location
            deliveryMethodId,
            shippingAddress,
            deliveryFee: fee
        },
        include: {
            deliveryLocation: true, // Include location instead of zone if we switched
            deliveryMethod: true
        }
    });
    return updated;
}
