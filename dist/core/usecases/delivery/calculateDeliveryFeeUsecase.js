"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryFeeUsecase = calculateDeliveryFeeUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function calculateDeliveryFeeUsecase(input) {
    const { orderId, deliveryZoneId, deliveryMethodId } = input;
    const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    const zone = await prismaClient_1.prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
    if (!zone || !zone.isActive)
        throw new Error("ZONE_NOT_AVAILABLE");
    const method = await prismaClient_1.prisma.deliveryMethod.findUnique({ where: { id: deliveryMethodId } });
    if (!method || !method.isActive)
        throw new Error("METHOD_NOT_AVAILABLE");
    const subtotal = order.totalAmount;
    let fee = zone.baseFee;
    if (zone.minAmountFree && subtotal >= zone.minAmountFree) {
        fee = 0;
    }
    // perKmFee à intégrer plus tard si tu ajoutes distance
    // ex: fee += (distanceKm * (zone.perKmFee ?? 0));
    return {
        deliveryFee: fee,
        zone,
        method
    };
}
