"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliveryZoneUsecase = createDeliveryZoneUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createDeliveryZoneUsecase(input) {
    const { name, city, minAmountFree, baseFee } = input;
    const zone = await prismaClient_1.prisma.deliveryZone.create({
        data: {
            name,
            city,
            minAmountFree,
            baseFee,
            isActive: true
        }
    });
    return zone;
}
