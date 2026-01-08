"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDeliveryToOrderUsecase = applyDeliveryToOrderUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const calculateDeliveryFeeUsecase_1 = require("./calculateDeliveryFeeUsecase");
async function applyDeliveryToOrderUsecase(input) {
    const { orderId, deliveryZoneId, deliveryMethodId, shippingAddress } = input;
    const { deliveryFee } = await (0, calculateDeliveryFeeUsecase_1.calculateDeliveryFeeUsecase)({
        orderId,
        deliveryZoneId,
        deliveryMethodId
    });
    const updated = await prismaClient_1.prisma.order.update({
        where: { id: orderId },
        data: {
            deliveryZoneId,
            deliveryMethodId,
            shippingAddress,
            deliveryFee
            // totalAmount reste le total produits; tu peux aussi stocker totalWithDelivery séparément si tu veux
        },
        include: {
            deliveryZone: true,
            deliveryMethod: true
        }
    });
    return updated;
}
