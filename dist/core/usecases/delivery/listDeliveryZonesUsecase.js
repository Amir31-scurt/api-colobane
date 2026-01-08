"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDeliveryZonesUsecase = listDeliveryZonesUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listDeliveryZonesUsecase() {
    return prismaClient_1.prisma.deliveryZone.findMany({
        orderBy: { createdAt: 'desc' }
    });
}
