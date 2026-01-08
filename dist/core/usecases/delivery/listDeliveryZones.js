"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDeliveryZones = listDeliveryZones;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listDeliveryZones() {
    return await prismaClient_1.prisma.deliveryZone.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            city: true,
            baseFee: true,
            minAmountFree: true,
            // perKmFee if needed
        }
    });
}
